require('dotenv').config();
const http    = require('http');
const app     = require('./index');
const server  = http.createServer(app);

server.listen(process.env.PORT, () => {
   console.log(`Servidor rodando na porta ${process.env.PORT}`);
});

server.on('error', (err) => {
   console.log('Erro no servidor:', err);
});
