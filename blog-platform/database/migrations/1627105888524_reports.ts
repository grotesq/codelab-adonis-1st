import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Reports extends BaseSchema {
  protected tableName = 'reports'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').notNullable();
      table.integer('post_id').nullable();
      table.integer('comment_id').nullable();
      table.text('content', 'longText').notNullable();
      table.string('status').notNullable().defaultTo('대기중');

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', {useTz: true})
      table.timestamp('updated_at', {useTz: true})
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
