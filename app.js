//Main server file
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const message = require("./services/SMS_service");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDocument = require("./config/swagger.json");

app.listen(port, () => {
  console.log("listening on port", port);
});

// use express router
app.use("/", require("./routes"));


//set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/apiDocs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
