import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

export default class PostsController {
  async create(context) {
    // context.response.status = 201;
    // context.response.status( 201 );
    return context.request.url();
  }

  async read({request}: HttpContextContract) {
    // request.qs()
    // request.body()
    // response.status(201)
    // response.abort(404)
    return request.url();
  }

  async update() {
    return 'update';
  }

  async delete() {
    return 'delete';
  }
}
