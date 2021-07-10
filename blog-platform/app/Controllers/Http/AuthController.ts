import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";

export default class AuthController {
  async signUp({request} : HttpContextContract) {
    // TODO : 데이터 유효성 검증
    const params = request.only([
      'email',
      'password',
      'displayName',
      'name'
    ])

    const user = await User.create(params)
    return user;
  }

  async signIn({auth, request} : HttpContextContract) {
    // TODO : 데이터 유효성 검증
    const params = request.only([
      'email',
      'password'
    ])
    const token = await auth.use('api').attempt(params.email, params.password)
    const user = await User.findByOrFail('email', params.email)
    return {
      user,
      token,
    }
  }
}






