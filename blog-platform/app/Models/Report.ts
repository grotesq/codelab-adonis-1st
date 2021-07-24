import {DateTime} from 'luxon'
import {BaseModel, BelongsTo, belongsTo, column} from '@ioc:Adonis/Lucid/Orm'
import Post from "App/Models/Post";
import Comment from "App/Models/Comment";

export default class Report extends BaseModel {
  @column({isPrimary: true})
  public id: number

  @column()
  public userId: number

  @column()
  public postId?: number

  @column()
  public commentId?: number

  @column()
  public content: string

  @column()
  public status: '대기중' | '처리완료' | '보류됨'

  @column.dateTime({autoCreate: true})
  public createdAt: DateTime

  @column.dateTime({autoCreate: true, autoUpdate: true})
  public updatedAt: DateTime

  @belongsTo(() => Post)
  public post: BelongsTo<typeof Post>

  @belongsTo(() => Comment)
  public comment: BelongsTo<typeof Comment>;
}
