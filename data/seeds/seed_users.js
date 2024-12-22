/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed =  async function(knex) {
  return await knex('users').insert([
    { id: 1, username: 'jeff', password:'password123' },
    { id: 2, username: 'john', password:'birthday1212' },
  ]);
};
