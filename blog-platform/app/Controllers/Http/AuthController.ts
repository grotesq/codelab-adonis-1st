import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import {schema, rules} from '@ioc:Adonis/Core/Validator'
import Role from "App/Models/Role";
import PasswordRule from "App/RegExps/PasswordRule";
import Mail from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'
import uid from "tiny-uid";
import VerifyToken from "App/Models/VerifyToken";
import Route from '@ioc:Adonis/Core/Route'

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

    // 이메일 인증 토큰 생성 및 전달
    const token = await VerifyToken.create({
      type: 'email',
      email: user.email,
      userId: user.id,
      token: uid()
    })
    const path = Route.makeSignedUrl(
      '/auth/sign-up/verify-email/:token',
      {token: token.token},
      {expiresIn: '2d'}
    );
    const link = Env.get('APP_URL') + path;
    await Mail.send(message => {
      message.from('no-reply@blog-platform.service')
      message.to(user.email);
      message.subject('[블로그 플랫폼] 이메일을 인증해주세요');
      message.htmlView('verify_email_for_sign_up', {user, link})
    })

    return user;
  }

  async verifyEmailForSignUp({params, request, response}:HttpContextContract) {
    if( !request.hasValidSignature() ) {
      response.status( 400 );
      return { message: '잘못된 요청입니다.' }
    }

    const { token } = params;
    const verifyToken = await VerifyToken.findByOrFail('token', token );
    const user = await User.findOrFail( verifyToken.userId );
    user.hasVerify = true;
    await user.save();

    return { message: '인증이 완료 되었습니다.' }
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
  async requestPasswordReset({request}: HttpContextContract) {
    const email = request.input('email');
    const user = await User.findByOrFail('email', email)
    const token = await VerifyToken.create({
      type: 'password-reset',
      userId: user.id,
      token: uid(),
    });
    // const url = Env.get('APP_URL') + '/auth/reset-password/' + token.token;
    const url = Route.makeSignedUrl('/auth/reset-password/:token', {
      token: token.token,
    }, {
      expiresIn: '1d',
    });

    await Mail.send((message) => {
      message
        .from('no-reply@blog-platform.service')
        .to(email)
        .subject('[블로그 플랫폼] 비밀번호 재설정 안내')
        .htmlView('emails/request_password_reset', {link: Env.get('APP_URL') + url});
    });

    return {message: '메일 전송 완료'};
  }

  async resetPasswordForm({request, response, view}: HttpContextContract) {
    if (!request.hasValidSignature()) {
      response.status(400)
      return {message: '유효한 주소가 아닙니다.'}
    }
    return view.render('reset_password_form')
  }

  async resetPassword({params, request, response}: HttpContextContract) {
    const {token} = params;
    const {password, passwordConfirmation} = request.only([
      'password',
      'passwordConfirmation'
    ]);
    const verifyToken = await VerifyToken.findByOrFail('token', token);
    const user = await User.findOrFail(verifyToken.userId);
    if (password !== passwordConfirmation) {
      response.status(400);
      return {message: '비밀번호 확인이 일치하지 않습니다.'}
    }
    user.password = password;
    await user.save();
    await verifyToken.delete()
    return {message: '수정되었습니다.'};
  }

  async verifyExistEmail({request}: HttpContextContract) {
    const email = request.input('email')
    const path = Route.makeSignedUrl('/auth/sign-up', {}, {expiresIn: '30m'});
    const link = Env.get('APP_URL') + path;
    await Mail.send(message => {
      message.from('no-reply@blog-platform.service')
      message.to(email)
      message.subject('[블로그 플랫폼] 회원 가입을 계속해주세요')
      message.htmlView('verify_email_form', {link})
    })
    return {message: '메일이 전송되었습니다.'}
  }
}





