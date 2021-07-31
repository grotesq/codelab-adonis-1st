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
import Encryption from '@ioc:Adonis/Core/Encryption'

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

Route.get('/posts', 'PostsController.list');
Route.get("/posts/:slug", 'PostsController.read'); // shortcut
Route.get("/posts/:slug/comments", 'CommentsController.list');

Route.get( '/encryption-test', () => {
  const encrypted = Encryption.encrypt( '010-1234-1234' );
  return Encryption.decrypt( encrypted );
} );

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

// TODO : 사용자 이미지 업로드
// TODO : 알림
