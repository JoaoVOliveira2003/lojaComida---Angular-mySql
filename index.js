const express        = require('express');
const cors           = require('cors');
const connection     = require('./connection');
const userRoute      = require('./routes/user');
const categoryRoute  = require('./routes/category');
const productRoute   = require('./routes/product');
const billRoute      = require('./routes/bill');
const dashboardRoute = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração das rotas
app.use('/user', userRoute);
app.use('/category', categoryRoute);
app.use('/product', productRoute);
app.use('/bill', billRoute);
app.use('/dash', dashboardRoute);

const PORT = 8081;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
