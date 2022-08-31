const mysql = require("mysql2");

//connection details to database
module.exports.dbConn = mysql.createConnection({
  host: "103.234.187.254",
  user: "mindit_dev",
  password: "mindit@123",
  database:"mindit_notification_engine"
});
