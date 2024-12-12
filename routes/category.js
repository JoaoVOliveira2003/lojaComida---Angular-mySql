const express    = require('express');
const connection = require('../connection'); // Conexão com o banco
const router     = express.Router();
const auth       = require('../services/authentication');
const checkRole  = require('../services/checkRole');

// Middleware para processar JSON no corpo da requisição
router.use(express.json());

// Adicionar uma categoria
router.post('/add', checkRole.checkRole, (req, res) => {
   let category = req.body;

   if (!category.name) {
      return res.status(400).json({ message: "O campo 'name' é obrigatório." });
   }

   const query = "INSERT INTO category (name) VALUES (?)";

   connection.query(query, [category.name], (err, results) => {
      if (!err) {
         return res.status(200).json({ message: "Categoria adicionada corretamente." });
      } else {
         console.log(err); // Log para depuração
         return res.status(500).json({ error: "Erro ao adicionar categoria.", details: err });
      }
   });
});

// Obter todas as categorias
router.get('/get', (req, res) => {
   const query = "SELECT * FROM category ORDER BY name"; // Ajustado para ordenação pelo nome

   connection.query(query, (err, results) => {
      if (!err) {
         return res.status(200).json(results);
      } else {
         console.log(err); // Log para depuração
         return res.status(500).json({ error: "Erro ao obter categorias.", details: err });
      }
   });
});

// Atualizar uma categoria
router.patch('/update', checkRole.checkRole, (req, res) => {
   let category = req.body;

   if (!category.id || !category.name) {
      return res.status(400).json({ 
         message: "Os campos 'id' e 'name' são obrigatórios para a atualização." 
      });
   }

   const query = "UPDATE category SET name = ? WHERE id = ?";

   connection.query(query, [category.name, category.id], (err, results) => {
      if (!err) {
         if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Categoria com ID não encontrada." });
         }
         return res.status(200).json({ message: "Categoria atualizada com sucesso." });
      } else {
         console.log(err); // Log para depuração
         return res.status(500).json({ error: "Erro ao atualizar categoria.", details: err });
      }
   });
});

module.exports = router;
