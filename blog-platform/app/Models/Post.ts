import {DateTime} from 'luxon'
import {BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany} from '@ioc:Adonis/Lucid/Orm'
import User from "App/Models/User";
import Comment from "App/Models/Comment";

export default class Post extends BaseModel {
  @column({isPrimary: true})
  public id: number

  @column()
  public userId: number;

  @column()
  public slug: string;

  @column()
  public subject: string;

  @column()
  public content: string;

  @column.dateTime()
  public publishAt: DateTime

  @column.dateTime({autoCreate: true})
  public createdAt: DateTime

  @column.dateTime({autoCreate: true, autoUpdate: true})
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  public comments: HasMany<typeof Comment>
}
