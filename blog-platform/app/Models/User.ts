import {DateTime} from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {afterFind, BaseModel, beforeSave, column, ManyToMany, manyToMany,} from '@ioc:Adonis/Lucid/Orm'
import Role from "App/Models/Role";
import Encryption from "@ioc:Adonis/Core/Encryption";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public displayName: string

  @column()
  public name: string

  @column()
  public avatar? : string

  @column()
  public contact? : string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public hasVerify: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  @beforeSave()
  public static async encryptContact( user: User ) {
    if( user.$dirty.contact ) {
      user.contact = Encryption.encrypt( user.contact );
    }
  }

  @afterFind()
  public static async decryptContact(user : User) {
    if( user.contact ) {
      user.contact = Encryption.decrypt( user.contact ) || '';
    }
  }

  @manyToMany(() => Role)
  public roles: ManyToMany<typeof Role>;
}
