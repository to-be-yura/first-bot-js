const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    // 'postgres://root:root@master.7a5d805d-5b1c-43d2-8e27-f727809384c9.c.dbaas.selcloud.ru:5433/yura_first_bot_js_bd'
    'yura_first_bot_js_bd',
    'root',
    'root',
    {
        host: '5.188.128.172',
        port: '5432',
        dialect: 'postgres',
    }
);