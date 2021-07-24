import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Report from "App/Models/Report";
import {schema} from "@ioc:Adonis/Core/Validator";

export default class ReportsController {
  async list({auth, request}: HttpContextContract) {
    const {page, perPage} = request.qs();
    if (auth.user) {
      await auth.user.load('roles');
      let query = Report.query()
        .preload('post')
        .preload('comment')
        .orderBy('created_at', 'desc')
      if (!auth.user.roles.find(role => role.code === 'admin')) {
        query = query.where('user_id', auth.user.id)
      }
      const reports = await query.paginate(page || 1, perPage || 12)
      return reports;
    }
  }

  async create({auth, request}: HttpContextContract) {
    const params = await request.validate({
      schema: schema.create({
        postId: schema.number.optional(),
        commentId: schema.number.optional(),
        content: schema.string()
      })
    })
    if (auth.user) {
      return await Report.create({
        ...params,
        userId: auth.user.id,
      });
    }
  }

  async update({params, request}: HttpContextContract) {
    const { id } = params;
    const status = request.input('status');

    const report = await Report.findOrFail(id);
    report.status = status;
    await report.save();

    return report;
  }
}
