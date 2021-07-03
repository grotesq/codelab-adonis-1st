import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import SignUpSchema from "App/Schemes/SignUpSchema";

export default class AuthController {
  async signUp( { request } : HttpContextContract) {
    await request.validate( { schema: SignUpSchema } )
    const params = request.only(['email','password','name']);
    return await User.create(params);
  }

  async signIn({auth,request}:HttpContextContract) {
    const email = request.input('email');
    const password = request.input('password');
    const token = await auth.use('api').attempt(email, password)
    const user = await User.findBy('email', email);
    return {
      user,
      token,
    };
  }

  async profile({auth}:HttpContextContract) {
    return auth.user;
  }

  async signOut({auth}:HttpContextContract){
    await auth.use('api').revoke()
    return 'ok';
  }
}
