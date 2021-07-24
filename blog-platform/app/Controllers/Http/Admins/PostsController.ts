import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Post from "App/Models/Post";

export default class PostsController {
  async list({request}:HttpContextContract) {
    const { page, perPage } = request.qs();
    const posts = await Post.query()
      .orderBy('created_at', 'desc')
      .paginate( page || 1, perPage || 12)
    return posts;
  }

  async create() {

  }

  async read() {

  }

  async update() {

  }

  async delete({params}: HttpContextContract) {
    const { id } = params;
    await Post.query().where('id', id).delete();
    return 'ok';
  }
}
