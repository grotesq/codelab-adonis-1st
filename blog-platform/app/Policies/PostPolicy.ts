import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Post from 'App/Models/Post'

export default class PostPolicy extends BasePolicy {
	public async update(user: User, post: Post) {
	  return user.id === post.userId;
  }
	public async delete(user: User, post: Post) {
	  return user.id === post.userId;
  }
}
