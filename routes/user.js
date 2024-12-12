const express    = require("express");
const connection = require("../connection");
const router     = express.Router();
const jwt        = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var auth         = require("../services/authentication");
var checkRole    = require("../services/checkRole");

require("dotenv").config();

router.post("/signup", (req, res) => {
  let user = req.body;

  // Define a query para verificar se o e-mail já existe
  const checkQuery =
    "SELECT email, password, role, status FROM user WHERE email = ?";
  connection.query(checkQuery, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        // Define a query para inserir o novo usuário
        const insertQuery =
          "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
        connection.query(
          insertQuery,
          [user.name, user.contactNumber, user.email, user.password],
          (err, results) => {
            if (!err) {
              return res.status(200).json({ message: "Sucesso" });
            } else {
              return res.status(500).json(err);
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Email já existe" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;

  const query = "select email, password, role, status from user where email=?";

  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password !== user.password) {
        return res.status(401).json({ message: "Senha ou usuário incorreto" });
      } else if (results[0].status === "false") {
        return res
          .status(401)
          .json({ message: "Espere pela aprovação dos ADM" });
      } else if (results[0].password === user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {
          expiresIn: "8h",
        });
        return res.status(200).json({ token: accessToken });
      } else {
        return res
          .status(400)
          .json({ message: "Algo errado, por favor tente novamente" });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// testar dps com as coisas de segurança, no postman não funcionou
router.post("/forgotPassword", (req, res) => {
  const user = req.body;
  const query = "SELECT email, password FROM user WHERE email = ?";

  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length === 0) {
        return res.status(200).json({
          message: "O email informado não está registrado no sistema.",
        });
      } else {
        const mailOption = {
          from: process.env.EMAIL,
          to: results[0].email,
          subject: "Recuperação de senha - Sistema Loja Coxinha",
          html: `
                  <p><b>Detalhes da sua conta no Sistema Loja Coxinha</b></p>
                  <br><b>Email:</b> ${results[0].email}
                  <br><b>Senha:</b> ${results[0].password}
                  <br><a href="http://localhost:4200/">Clique aqui para acessar o sistema</a>
               `,
        };

        transporter.sendMail(mailOption, (error, info) => {
          if (error) {
            console.log("Erro ao enviar o email:", error);
          } else {
            console.log("Email enviado com sucesso:", info.response);
          }
        });

        return res
          .status(200)
          .json({ message: "Email enviado com os detalhes da sua conta." });
      }
    } else {
      return res.status(500).json({
        error: "Erro ao processar a solicitação. Tente novamente mais tarde.",
      });
    }
  });
});

/*
   Quando você paassa auth.authenticateToken como um parâmetro no meio (middleware),
   o Express irá exaecutá-lo antes de prosseguir para a função principal da rota. 
   Se o token for válido, o middleware chamará next(), permitindo que a função da rota seja executada.
   Caso contrário, ele bloqueará o acesso e retornará uma mensagem de erro.

router.get('/get',auth.authenticateToken,(req,res)=>{
*/
router.get("/get", (req, res) => {
  var query =
    "select id,name,email,contactNumber,status from user where role='user'";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

//router.patch('/update',auth.authenticateToken,(req,res)=>{
router.patch("/update", (req, res) => {
  let user = req.body;
  var query = "update user set status=? where id=?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "ID do usuario não existe" });
      }
      return res.status(200).json({ message: "update feito" });
    } else {
      return res.status(500).json(err);
    }
  });
});

//router.get('/checkToken',auth.authenticateToken,(req,res)=>{
router.get("/checkToken", (req, res) => {
  return res.status(200).json({ message: "true" });
});

router.post("/changePassword", (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  var query = "select * from user where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        return res.status(400).json({ message: "Senha antiga errado" });
      } else if (results[0].password == user.oldPassword) {
        query = "update user set password=? where email=?";
        connection.query(query, [user.newPassword, email], (err, results) => {
          if (!err) {
            return res.status(200).json({ message: "Mensagem ajustada." });
          } else {
            return res.status(500).json(err);
          }
        });
      } else {
        return res.status(400).json({ message: "Algo errado, tente depois." });
      }
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;
