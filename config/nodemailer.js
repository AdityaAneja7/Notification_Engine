const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

//server setup to emails
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "mindhosting19@gmail.com",
    pass: "klvastdaldfcqvgi",
  },
});

//setup path to email template in views folder
let renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, "../views/mailers", relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log("Error in rendering template ");
        return;
      }
      mailHTML = template;
    }
  );

  return mailHTML;
};

//exported both functions
module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate,
};
