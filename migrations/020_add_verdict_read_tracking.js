exports.up = function(knex) {
  return knex.schema.table('claims', table => {
    table.timestamp('verdict_read_at').nullable();
    table.boolean('verdict_notified').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('claims', table => {
    table.dropColumn('verdict_read_at');
    table.dropColumn('verdict_notified');
  });
};
