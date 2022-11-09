require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'db_program',
        host: '127.0.0.1',
        dialect: 'mysql',
        timezone: '+09:00',
    },
    test: {
        username: 'root',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'db_program_test',
        host: '127.0.0.1',
        dialect: 'mysql',
    },
    production: {
        username: 'root',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'db_program',
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false,
    },
}