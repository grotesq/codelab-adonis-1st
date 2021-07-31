import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

export default class OnlyVerified {
  public async handle({auth, response}: HttpContextContract, next: () => Promise<void>) {
    if (auth.user) {
      if (auth.user.hasVerify) {
        await next()
      }
    }
    response.status(403);
    response.json({message: '권한이 없습니다.'});
  }
}
