import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import {schema, rules} from '@ioc:Adonis/Core/Validator'
import Role from "App/Models/Role";

export default class AuthController {
  async signUp({request}: HttpContextContract) {
    const signUpSchema = schema.create({
      email: schema.string({trim: true}, [
        rules.email(),
        rules.unique({table: 'users', column: 'email'}),
      ]),
      displayName: schema.string({trim: true}, [
        // TODO : displayName에 대한 정규표현식 적용 여부 고민 필요
        rules.unique({table: 'users', column: 'display_name'}),
      ]),
      name: schema.string({trim: true}),
      password: schema.string({trim: true}, [
        // rules.minLength(6),
        rules.regex(/^([a-zA-Z0-9@*#]{6,64})$/)
      ])
    })

    const params = await request.validate({schema: signUpSchema})
    const role = await Role.findByOrFail('code', 'general')
    const user = await User.create(params)
    await user.related('roles').attach([role.id]);
    return user;
  }

  async signIn({auth, request}: HttpContextContract) {
    const params = await request.validate({
      schema: schema.create({
        email: schema.string({trim: true}, [
          rules.email()
        ]),
        password: schema.string({trim: true}, [
          rules.regex(/^([a-zA-Z0-9@*#]{6,64})$/)
        ]),
      })
    })
    const token = await auth.use('api').attempt(params.email, params.password)
    const user = await User
      .query()
      .preload('roles')
      .where('email', params.email)
      .firstOrFail()
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





