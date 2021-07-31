/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import crypto from 'crypto';
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 */

Route.get('/', async () => {
  return {hello: 'world'}
})

Route.post('/auth/sign-up', 'AuthController.signUp');
Route.post('/auth/sign-in', 'AuthController.signIn');
Route.get('/auth/verify-email', 'AuthController.verifyEmail');
Route.get('/auth/verify-display-name', 'AuthController.verifyDisplayName')
Route.post('/auth/request-password-reset', 'AuthController.requestPasswordReset')
Route.get('/auth/reset-password/:token', 'AuthController.resetPasswordForm')
Route.patch('/auth/reset-password/:token', 'AuthController.resetPassword')
Route.post('/auth/verify-exist-email', 'AuthController.verifyExistEmail')
Route.get('/auth/sign-up', ({request}) => {
  if (!request.hasValidSignature()) {
    return 'error';
  }
  return '회원가입';
})
Route.get('/auth/sign-up/verify-email/:token', 'AuthController.verifyEmailForSignUp')

Route.get('/posts', 'PostsController.list');
Route.get("/posts/:slug", 'PostsController.read'); // shortcut
Route.get("/posts/:slug/comments", 'CommentsController.list');

Route.get('/users/:displayName', 'UsersController.list');
Route.get('/users/:displayName/:slug', 'UsersController.read');

Route.group(() => {
  Route.get('/auth/verify-token', 'AuthController.verifyToken');

  Route.get('/me', 'MeController.getProfile')
  Route.patch('/me', 'MeController.updateProfile')
  Route.delete('/me', 'MeController.leave')
  Route.get('/me/posts', 'MeController.getPosts')
  Route.get('/me/posts/:slug', 'MeController.getPost')

  Route.post('/posts', 'PostsController.create')
  Route.patch('/posts/:slug', 'PostsController.update')
  Route.delete('/posts/:slug', 'PostsController.delete')

  Route.post('/posts/:slug/comments', 'CommentsController.create')
  Route.patch('/posts/:slug/comments/:id', 'CommentsController.update')
  Route.delete('/posts/:slug/comments/:id', 'CommentsController.delete')
  Route.patch('/comments/:id', 'CommentsController.update') // shortcut
  Route.delete('/comments/:id', 'CommentsController.delete') // shortcut

  // 신고
  Route.get('/reports', 'ReportsController.list');
}).middleware(['auth'])

Route.group(() => {
  Route.post('/reports', 'ReportsController.create');

  Route.get('/scraps', 'ScrapsController.list');
  Route.post('/scraps', 'ScrapsController.create');
  Route.delete('/scraps/:id', 'ScrapsController.delete');
}).middleware(['auth', 'generalsOnly']);

Route.group(() => {
  Route.get('/posts', 'Admins/PostsController.list')
  Route.delete('/posts/:id', 'Admins/PostsController.delete')

  Route.patch('/reports/:id', 'ReportsController.update');
}).prefix('/admins').middleware(['auth', 'adminsOnly'])

Route.get('/email-verified-only', () => {
  return '인증된 사용자 전용 페이지';
}).middleware(['auth', 'onlyVerified'])

Route.get('/socket-demo', ({view}) => {
  return view.render('socket');
})

Route.get('/find-user', async ({request}) => {
  const {token} = request.qs();
  const split = token.split('.');
  const id = Buffer.from(split[0], "base64").toString("utf-8");
  const hash = crypto.createHash('sha256').update(split[1]).digest('hex');
  const apiToken = await Database.from('api_tokens')
    .select(['user_id'])
    .where('id', id)
    .where('token', hash)
    .firstOrFail()
  const user = await User.findOrFail( apiToken.user_id )
  return user;
})

// TODO : 사용자 이미지 업로드
// TODO : 알림
