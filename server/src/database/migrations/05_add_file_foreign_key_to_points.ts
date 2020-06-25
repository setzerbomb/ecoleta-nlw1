import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.alterTable('points', (table) => {
    table
      .integer('file_id')
      .notNullable()
      .unsigned()
      .index()
      .references('id')
      .inTable('files');
    table.dropColumn('image');
  });
}

export async function down(knex: Knex) {
  return knex.schema.alterTable('points', (table) => {
    table.dropColumn('file_id');
    table.string('image').notNullable();
  });
}
