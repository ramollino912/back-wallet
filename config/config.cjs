require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'default',
    password: process.env.DB_PASSWORD || '1U0hcQmxMuTz',
    database: process.env.DB_NAME || 'wallet',
    host: process.env.DB_HOST || 'ep-white-dust-a4ao0h56.us-east-1.aws.neon.tech',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};
