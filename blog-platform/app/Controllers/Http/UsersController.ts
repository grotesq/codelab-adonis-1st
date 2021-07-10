import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Post from "App/Models/Post";
import User from "App/Models/User";
import {DateTime} from "luxon";

export default class UsersController {
  async list({params, request}: HttpContextContract) {
    const {displayName} = params;
    const {page, perPage} = request.qs();
    const user = await User.findByOrFail('displayName', displayName);
    return await Post.query().where('user_id', user.id)
      .preload('user')
      .where('publish_at', '<=', DateTime.now().toISO())
      .orderBy('publish_at', 'desc')
      .paginate(page || 1, perPage || 12);
  }

  async read({params, response}: HttpContextContract) {
    const {displayName, slug} = params;
    const user = await User.findByOrFail('displayName', displayName);
    const post = await Post.query()
      .preload('user')
      .where('user_id', user.id)
      .where('slug', slug)
      .first()
    if (!post) {
      response.status(404)
      return {message: '포스트를 찾을 수 없습니다.'}
    }
    return post;
  }
}
