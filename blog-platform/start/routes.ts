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
}).middleware('auth')

// TODO : 사용자 이미지 업로드
// TODO : 입력 데이터 유효성 검증
// TODO : 권한 구분
// TODO : 관리자 API
// TODO : 신고 API
// TODO : 문서화
// TODO : 스크랩
// TODO : 알림
