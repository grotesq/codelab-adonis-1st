import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Scrap from "App/Models/Scrap";
import {schema} from "@ioc:Adonis/Core/Validator";

export default class ScrapsController {
  async list({auth, request}: HttpContextContract) {
    const {page, perPage} = request.qs();
    if (auth.user) {
      const scraps = await Scrap.query()
        .orderBy('created_at', 'desc')
        .preload('post')
        .paginate(page || 1, perPage || 12)
      return scraps;
    }
  }

  async create({auth, request}: HttpContextContract) {
    const params = await request.validate({
      schema: schema.create({
        postId: schema.number()
      })
    });
    if (auth.user) {
      const exist = await Scrap.query()
        .where('user_id', auth.user.id)
        .where('post_id', params.postId)
        .first();
      if( exist ) {
        // case 1
        // await exist.delete()
        // case 2
        // return response.status(409).json( { message: '이미 스크랩된 포스트입니다.'});
        // case 3
        // await exist.delete()
        // return 'ok';
      }
      const scrap = await Scrap.create({
        ...params,
        userId: auth.user.id,
      });
      await scrap.load('post');
      return scrap;
    }
  }

  async delete({auth, params, response}: HttpContextContract) {
    const {id} = params;
    const report = await Scrap.findOrFail(id);
    if (auth.user && report.userId !== auth.user.id) {
      response.status(403);
      return {message: '권한이 없습니다.'};
    }
    await report.delete();
    return 'ok';
  }
}
