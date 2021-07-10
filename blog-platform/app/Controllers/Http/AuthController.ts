import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";

export default class AuthController {
  async signUp({request}: HttpContextContract) {
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

  async signIn({auth, request}: HttpContextContract) {
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

  async verifyToken() {
    return 'ok';
  }

  async verifyEmail({request, response}: HttpContextContract) {
    const {email} = request.qs()
    const exist = await User.findBy('email', email);
    if (exist) {
      response.status(409);
      return {message: '이미 사용중인 이메일입니다.'}
    }
    return 'ok';
  }

  async verifyDisplayName({request, response}) {
    const {displayName} = request.qs()
    const exist = await User.findBy('displayName', displayName)
    if (exist) {
      response.status(409)
      return {message: '이미 사용중인 디스플레이 네임입니다.'}
    }
    return 'ok';
  }
}






