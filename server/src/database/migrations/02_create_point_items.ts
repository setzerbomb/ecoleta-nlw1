import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('point_items', (table) => {
    table
      .integer('point_id')
      .notNullable()
      .unsigned()
      .index()
      .references('id')
      .inTable('points');
    table
      .integer('item_id')
      .notNullable()
      .unsigned()
      .index()
      .references('id')
      .inTable('items');
    table.unique(['point_id', 'item_id']);
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('point_items');
}
