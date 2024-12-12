const mysql = require('mysql');
require('dotenv').config();

// Verifique se as variáveis de ambiente estão presentes
if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USERNAME || !process.env.DB_NAME) {
    console.error('Por favor, defina todas as variáveis de ambiente para a conexão com o banco de dados.');
    process.exit(1); // Sai do processo se as variáveis não estiverem definidas
}

var connection = mysql.createConnection({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000 // Timeout de conexão (10 segundos)
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados!');
    }
});

module.exports = connection;
