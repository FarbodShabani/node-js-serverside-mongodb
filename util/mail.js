const nodemailer = require("nodemailer");


const sendEmail = async (email, subject, html) => {

  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
      auth:{
        user:"6f6a7d2020e7b5",
        pass: "ff29caa40d161d",
      }
  });

  const mailOptions = {
    from: "saina and farbod's Shop, <fs@shgh.com>",
    to: email,
    subject: subject,
    html:  html,
  }

 await transport.sendMail(mailOptions)

}



// const transport = () => {

//   console.log("hou");
//   return nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "6f6a7d2020e7b5",
//       pass: "ff29caa40d161d"
//     }
//   });
// }

module.exports = sendEmail;