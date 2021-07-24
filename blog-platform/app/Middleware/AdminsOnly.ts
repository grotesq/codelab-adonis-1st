import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

export default class AdminsOnly {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    await auth.user?.load('roles');
    if (auth.user?.roles.find(role => role.code === 'admin')) {
      await next()
    } else {
      response.status(403);
      response.json({
        message: '권한이 없습니다.'
      })
    }
  }
}
