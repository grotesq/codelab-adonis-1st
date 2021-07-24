import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Roles extends BaseSchema {
  protected tableName = 'roles'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable(); // 관리자, 일반 사용자
      table.string('code').unique().notNullable(); // admin, general
      table.string('description').nullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.createTable('role_user', table => {
      table.increments('id')
      table.integer('role_id').notNullable()
      table.integer('user_id').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable('role_user')
    this.schema.dropTable(this.tableName)
  }
}
