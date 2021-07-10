import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from "App/Models/Post";
import User from "App/Models/User";
import { DateTime } from "luxon";
import uid from 'tiny-uid';

function createSlug(subject) {
  let slug = subject.trim().replace(/\s/gi, '-')
  if( slug.length > 27 ) slug = slug.substr(0, 28 );
  slug = encodeURIComponent(slug)
  slug = slug += `-${uid()}`;
  return slug;
}

export default class PostsController {
  async list({request}:HttpContextContract) {
    const { displayName, page, perPage } = request.qs();
    let query = Post.query()
      .where('publish_at', '<=', DateTime.now().toISO() )
      .orderBy('publish_at','desc');
    if( displayName ) {
      const user = await User.findByOrFail('display_name', displayName );
      query = query.where('user_id', user.id);
    }
    const posts = await query.paginate(page || 1, perPage || 12);
    return posts;
  }

  async create({auth, request}:HttpContextContract) {
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

  async read({params, response}:HttpContextContract) {
    let { id } = params;
    let slug;
    if( Number.isNaN( parseInt( id, 10 ) ) ) {
      slug = id;
    }

    let query = Post.query()
      .where('publish_at', '<=', DateTime.now().toISO())
    if( slug ) query = query.where( 'slug', slug )
    else  query = query.where( 'id', id )

    const post = await query.first();
    if( !post ) {
      response.status(404);
      return { message: '조회할 데이터가 없습니다.' }
    }
    return post;
  }

  async update({bouncer, request, params}:HttpContextContract) {
    const { id } = params;
    const post = await Post.findOrFail(id);
    await bouncer.authorize('editPost', post);

    const subject = request.input('subject');
    const content = request.input('content');
    const publishAt = request.input('publishAt');
    if( subject ) {
      if( post.subject !== subject ) {
        post.slug = createSlug(subject);
      }
      post.subject = subject;
    }
    if( content ) post.content = content;
    if( publishAt ) post.publishAt = publishAt;
    return await post.save();
  }

  async delete({bouncer, params}) {
    const { id } = params;
    const post = await Post.findOrFail(id);
    await bouncer.authorize('deletePost', post);
    await post.delete()
    return 'ok';
  }
}
