import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Post from "App/Models/Post";
import User from "App/Models/User";
import {DateTime} from "luxon";
import uid from 'tiny-uid';

function createSlug(subject) {
  let slug = subject.trim().replace(/\s/gi, '-')
  if (slug.length > 27) slug = slug.substr(0, 28);
  slug = encodeURIComponent(slug)
  slug = slug += `-${uid()}`;
  return slug;
}

export default class PostsController {
  /**
   * @swagger
   * /posts:
   *   get:
   *     tags:
   *       - Post
   *     summary: 포스트 조회
   *     description: Slient Auth 적용으로 미인증/인증시 서로 다른 결과 출력
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 성공
   */
  async list({request}: HttpContextContract) {
    const {displayName, page, perPage} = request.qs();
    let query = Post.query()
      .preload('user')
      .where('publish_at', '<=', DateTime.now().toISO())
      .orderBy('publish_at', 'desc');
    if (displayName) {
      const user = await User.findByOrFail('display_name', displayName);
      query = query.where('user_id', user.id);
    }
    const posts = await query.paginate(page || 1, perPage || 12);
    return posts;
  }

  async create({auth, request}: HttpContextContract) {
    const subject = request.input('subject')
    const content = request.input('content')
    const userId = auth.user?.id;
    const publishAt = request.input('publishAt', DateTime.now().toISO())
    const slug = createSlug(subject);

    const post = await Post.create({
      userId,
      subject,
      content,
      slug,
      publishAt,
    })

    return post;
  }

  async read({params}: HttpContextContract) {
    const {slug} = params;
    const post = await Post.query()
      .preload('user')
      .where('publish_at', '<=', DateTime.now().toISO())
      .where('slug', slug)
      .firstOrFail()
    return post;
  }

  async update({bouncer, request, params}: HttpContextContract) {
    const {slug} = params;
    const post = await Post.findByOrFail('slug', slug);
    await bouncer.with('PostPolicy').authorize('update', post);

    const subject = request.input('subject');
    const content = request.input('content');
    const publishAt = request.input('publishAt');
    if (subject) {
      if (post.subject !== subject) {
        post.slug = createSlug(subject);
      }
      post.subject = subject;
    }
    if (content) post.content = content;
    if (publishAt) post.publishAt = publishAt;
    return await post.save();
  }

  async delete({bouncer, params}) {
    const {slug} = params;
    const post = await Post.findByOrFail('slug', slug);
    await bouncer.with('PostPolicy').authorize('delete', post);
    await post.delete()
    return 'ok';
  }
}
