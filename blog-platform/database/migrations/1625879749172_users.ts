import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()

      table.string('display_name', 31).notNullable().unique()
      table.string('name', 31).notNullable()
      table.string('avatar', 255).nullable()
      table.string('contact', 255).nullable()

      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()
      table.boolean('has_verify').defaultTo(false);

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
