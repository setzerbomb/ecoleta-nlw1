import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.alterTable('point_items', (table) => {
    table.increments('id').primary();
  });
}

export async function down(knex: Knex) {
  return knex.schema.alterTable('point_items', (table) => {
    table.dropColumn('id');
  });
}
