import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MeController {
  async getProfile( { auth } : HttpContextContract) {
    return auth.user;
  }
}
