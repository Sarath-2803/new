require('dotenv').config();

console.log('Connecting to:', process.env.DATABASE_URI);

module.exports = {
  development: {
    username: "postgres",
    password: "root123",
    database: "myshop_db",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  test: {
    username: "postgres",
    password: "root123",
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  production: {
    use_env_variable: "DATABASE_URI",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    }
  }
};
