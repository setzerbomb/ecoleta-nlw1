import path from 'path';

module.exports = {
  client: 'pg',
  connection: {
    host: '192.168.99.100',
    user: 'docker',
    password: 'docker',
    database: 'ecoleta',
  },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
  },
};
