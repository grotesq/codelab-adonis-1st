import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";

export default class TempAuth {
  // Authorization: Temp 7
  public async handle({auth, request, response}: HttpContextContract, next: () => Promise<void>) {
    if( process.env.NODE_ENV === 'production' ) {
      await next();
      return;
    }
    const header = request.header('Authorization');
    if (header?.startsWith('Temp ')) {
      const id = header?.split('Temp ').pop()
      const user = await User.findOrFail(parseInt(id || '2', 10));
      await auth.use('api').login(user)
      await auth.use('api').authenticate()
      // const token = await auth.use('api').generate(user);
      await next()
    }
    else {
      response.status(500);
      response.json({
        message: '인증에 실패했습니다.',
      })
    }
  }
}
