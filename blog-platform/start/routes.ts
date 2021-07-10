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

// blog-platform.com
// blog-platform.com/@/user1
// user1.blog-platform.com - 제외

// [GET] /:displayName/posts/
// [GET] posts?displayName=user1

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return {hello: 'world'}
})

Route.post('/auth/sign-up', 'AuthController.signUp');
Route.post('/auth/sign-in', 'AuthController.signIn');

Route.get('/posts', 'PostsController.list');
Route.get("/posts/:id", 'PostsController.read')

Route.group(() => {
  Route.get('/me', 'MeController.getProfile')

  Route.post('/posts', 'PostsController.create')
  Route.patch('/posts/:id', 'PostsController.update')
  Route.delete('/posts/:id', 'PostsController.delete')
}).middleware('auth')
