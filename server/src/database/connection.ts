import knex from 'knex';

const connection = knex({
  client: 'pg',
  connection: {
    host: '192.168.99.100',
    user: 'docker',
    password: 'docker',
    database: 'ecoleta',
  },
});

export default connection;
