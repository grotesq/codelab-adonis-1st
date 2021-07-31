import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import {schema, rules} from '@ioc:Adonis/Core/Validator'
import Role from "App/Models/Role";
import PasswordRule from "App/RegExps/PasswordRule";
import Mail from '@ioc:Adonis/Addons/Mail'

export default class AuthController {
  /**
   * @swagger
   * /auth/sign-up:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 회원 가입
   *     requestBody:
   *       content:
   *         application/x-www-form-urlencoded:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: 이메일
   *               password:
   *                 type: string
   *                 description: 비밀번호
   *               displayName:
   *                 type: string
   *                 description: 디스플레이 네임
   *               name:
   *                 type: string
   *                 description: 이름
   *               contact:
   *                 type: string
   *                 description: 연락처
   *             required:
   *               - email
   *               - password
   *               - displayName
   *               - name
   *     responses:
   *       200:
   *         description: 성공
   */
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
        rules.regex(PasswordRule)
      ]),
      contact: schema.string.optional({trim: true}),
    })

    const params = await request.validate({schema: signUpSchema})
    const role = await Role.findByOrFail('code', 'general')
    const user = await User.create(params)
    await user.related('roles').attach([role.id]);
    return user;
  }

  /**
   * @swagger
   * /auth/sign-in:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 로그인
   *     requestBody:
   *       content:
   *         application/x-www-form-urlencoded:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: 이메일
   *               password:
   *                 type: string
   *                 description: 비밀번호
   *             required:
   *               - email
   *               - password
   *     responses:
   *       200:
   *         description: 성공
   */
  async signIn({auth, request}: HttpContextContract) {
    const params = await request.validate({
      schema: schema.create({
        email: schema.string({trim: true}, [
          rules.email()
        ]),
        password: schema.string({trim: true}, [
          rules.regex(PasswordRule)
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

  /**
   * @swagger
   * /auth/request-password-reset:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 비밀번호 재설정 요청
   *     requestBody:
   *       content:
   *         application/x-www-form-urlencoded:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: 이메일
   *             required:
   *               - email
   *     responses:
   *       200:
   *         description: 성공
   */
  async requestPasswordReset({request} :HttpContextContract) {
    const email = request.input('email');

    // email test
    await Mail.send((message) => {
      message
        .from('info@example.com')
        .to(email)
        .subject('Welcome Onboard!')
        .htmlView('emails/request_password_reset', { name: 'John' } );
    } );
  }
}





