const express   = require("express");
const router    = express.Router();
const connection= require("../connection");
const ejs       = require("ejs");
const pdf       = require("html-pdf");
const path      = require("path");
const uuid      = require("uuid");

router.post("/generateReport", (req, res) => {
  try {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;

    // Verificar se "productDetails" foi enviado
    if (!orderDetails.productDetails) {
      return res.status(400).json({ error: "Product details are required" });
    }

    // Certificar que "productDetails" está como objeto (se for uma string JSON, usa-se JSON.parse)
    let productDetailsReport;
    if (typeof orderDetails.productDetails === "string") {
      try {
        productDetailsReport = JSON.parse(orderDetails.productDetails);
      } catch (error) {
        return res
          .status(400)
          .json({ error: "Invalid JSON format for product details" });
      }
    } else {
      productDetailsReport = orderDetails.productDetails;
    }

    // Definir o valor de createdBy (usando orderDetails.createdBy ou res.locals.email)
    const createdBy = orderDetails.createdBy || res.locals.email; // Se não passar, usa o email do usuário autenticado

    // Se nenhum valor de createdBy for definido, retornar erro
    if (!createdBy) {
      return res.status(400).json({ error: "'createdBy' is required" });
    }

    // Query para salvar no banco
    const query =
      "INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(
      query,
      [
        orderDetails.name,
        generatedUuid,
        orderDetails.email,
        orderDetails.contactNumber,
        orderDetails.paymentMethod,
        orderDetails.totalAmount,
        JSON.stringify(productDetailsReport),
        createdBy, // Usando o valor de createdBy
      ],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Gerar o relatório PDF
        ejs.renderFile(
          path.join(__dirname, "../routes", "report.ejs"),
          {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount,
          },
          (err, data) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Criar o PDF e salvar
            pdf
              .create(data)
              .toFile(
                "./generated_pdf/" + generatedUuid + ".pdf",
                (err, result) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  } else {
                    return res.status(200).json({ uuid: generatedUuid });
                  }
                }
              );
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



router.post("/getPdf", function (req, res) {
   const orderDetails = req.body;
   const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;

   // Verificar se o arquivo PDF já existe
   if (fs.existsSync(pdfPath)) {
      res.contentType("application/pdf");
      return fs.createReadStream(pdfPath).pipe(res);
   }

   // Se o PDF não existir, gera um novo
   const productDetailsReport = JSON.parse(orderDetails.orderDetails);

   ejs.renderFile(
      path.join(__dirname, "../routes", "report.ejs"),
      {
         productDetails: productDetailsReport,
         name: orderDetails.name,
         email: orderDetails.email,
         contactNumber: orderDetails.contactNumber,
         paymentMethod: orderDetails.paymentMethod,
         totalAmount: orderDetails.totalAmount,
      },
      (err, html) => {
         if (err) {
            return res.status(500).json({ error: err.message });
         }

         // Gerar um UUID único para o nome do PDF, caso não tenha sido fornecido
         const generatedUuid = orderDetails.uuid || Date.now().toString();

         const pdfFilePath = `./generated_pdf/${generatedUuid}.pdf`;

         pdf.create(html).toFile(pdfFilePath, (err, result) => {
            if (err) {
               return res.status(500).json({ error: err.message });
            }

            // Retornar o UUID do PDF gerado
            return res.status(200).json({ uuid: generatedUuid });
         });
      }
   );
});

router.get('/getBills',(req,res,next)=>{
  const query = "SELECT * FROM order ORDER BY id DESC"; 

  connection.query(query, (err, results) => {
     if (!err) {
        return res.status(200).json(results);
     } else {
        console.log(err); 
        return res.status(500).json({ error: "Erro ao obter dados.", details: err });
     }
  });
})

router.delete('/delete/:id',(req,res,next)=>{
  const id = req.params.id;
  const query = "delete from bill where id=?"; 

  connection.query(query,[id],(err, results) => {
     if (!err) {
        if(results.affectedRows == 0){
          return res.status(404).json({message:'id n achado'});
        }
        return res.status(200).json({message:'apagada corretamente'});
     } else {
        console.log(err); 
        return res.status(500).json({ error: "Erro ao obter dados.", details: err });
     }
  });
})

module.exports = router;
