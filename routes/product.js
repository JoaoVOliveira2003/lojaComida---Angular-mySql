const express    = require("express");
const connection = require("../connection");
const router     = express.Router();
var auth         = require("../services/authentication");
var checkRole    = require("../services/checkRole");

router.post("/add", checkRole.checkRole, (req, res) => {
  let product = req.body;
  var query =
    "insert into product(name,categoryID,description,price,status) values (?,?,?,?,'true')";
  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price],
    (err, results) => {
      if (!err) {
        return res
          .status(200)
          .json({ message: "Produto adicionado corretamente." });
      } else {
        return res.status(500).json({ err });
      }
    }
  );
});

router.get("/get", (req, res, next) => {
  var query =
    "SELECT p.id,p.name,p.categoryID,p.description,p.price,p.status FROM product p INNER JOIN category c ON p.categoryID = c.id;";
  connection.query(query, (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("/getByCategory/:id", (req, res, next) => {
  const id = req.params.id;
  var query =
    "select id,name from product where categoryId=? and status='true'";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.get("./getById:id", (req, res, next) => {
  const id = req.params.id;
  var query = "select id,name,description,price from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      return res.status(200).json(results[0]);
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/update", checkRole.checkRole, (req, res, next) => {
  let product = req.body;
  var query =
    "update product set name=?,categoryId=?,description=?,price=? where id=?";
  connection.query(
    query,
    [
      product.name,
      product.categoryId,
      product.description,
      product.price,
      product.id,
    ],
    (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Id do projuto n achado" });
        }
        return res
          .status(200)
          .json({ message: "Produto atualizado corretamente" });
      } else {
        return res.status(500).json(err);
      }
    }
  );
});

router.delete("/delete/:id", checkRole.checkRole, (req, res, next) => {
  const id = req.params.id;
  var query = "delete from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "Id do projuto n achado" });
      }
      return res.status(200).json({ message: "Produto deletado não achado" });
    } else {
      return res.status(500).json(err);
    }
  });
});

router.patch("/updateStatus", checkRole.checkRole, (req, res, next) => {
  let user = req.body;
  var query = "update product set status=? where id=?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        return res.status(404).json({ message: "Id do projuto n achado" });
      }
      return res.status(200).json({ message: "Produto de status feito corretamente" });
    } else {
      return res.status(500).json(err);
    }
  });
});

module.exports = router;