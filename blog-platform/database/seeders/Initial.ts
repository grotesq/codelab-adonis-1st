import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from "App/Models/User";
import Role from "App/Models/Role";

export default class InitialSeeder extends BaseSeeder {
  public async run() {
    await User.createMany([
      {
        email: 'admin@admin.com',
        password: 'admin-password',
        displayName: 'admin',
        name: 'Admin',
      },
      {
        email: 'user@example.com',
        password: 'password',
        displayName: 'user',
        name: 'User'
      }
    ])
    await Role.createMany([
      {code: 'admin', name: '관리자', description: '관리자'},
      {code: 'general', name: '일반 사용자', description: '일반 사용자'},
    ])
    const admin = await User.findByOrFail('email', 'admin@admin.com');
    const user = await User.findByOrFail('email', 'user@example.com');
    const adminRole = await Role.findByOrFail('code', 'admin');
    const generalRole = await Role.findByOrFail('code', 'general');
    await admin.related('roles').attach([adminRole.id])
    await user.related('roles').attach([generalRole.id])
    // Write your database queries inside the run method
  }
}
