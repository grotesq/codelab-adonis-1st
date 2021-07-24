import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from "App/Models/User";
import Post from "App/Models/Post";
import Application from '@ioc:Adonis/Core/Application'
import { cuid } from '@ioc:Adonis/Core/Helpers'

interface UpdateParams {
  name?: string,
  displayName?: string,
  avatar?: string,
}

export default class MeController {
  async getProfile( { auth } : HttpContextContract) {
    return auth.user;
  }

  async updateProfile({auth,request, response}:HttpContextContract) {
    const displayName = request.input('displayName')
    const name = request.input('name')
    const avatar = request.input('avatar')
    // const avatar = request.file('avatar');
    const params : UpdateParams = {
      displayName,
      name,
      avatar
    };

    // 서버 인스턴스 내 스토리지에 저장할 경우
    // if( avatar ) {
    //   const dir = '/uploads';
    //   const name = cuid() + '.' + avatar.clientName?.split('.').pop();
    //   await avatar.move(Application.publicPath(dir), {
    //     name,
    //   })
    //   params.avatar = `${dir}/${name}`;
    // }

    if( displayName && displayName !== auth.user?.displayName ) {
      const exist = await User.findBy( 'displayName', displayName );
      if( exist ) {
        response.status(409)
        return { message: '이미 사용중인 displayName 입니다.' };
      }
    }

    auth.user?.merge( params );
    await auth.user?.save();
    return auth.user;
  }

  async leave({auth}) {
    await auth.user?.delete();
    return 'ok';
  }

  async getPosts({auth, request}) {
    const { page, perPage } = request.qs();
    return await Post.query().orderBy('publish_at','desc')
      .where('user_id', auth.user?.id)
      .paginate(page || 1, perPage || 12)
  }

  async getPost({auth,params}) {
    const { slug } = params;
    return await Post.query().where('user_id', auth.user?.id)
      .where('slug', slug)
      .firstOrFail()
  }
}
