const nodemailer = require('nodemailer');


const sendEmail = async options => {
  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  //
  //
  const mailOptions = {
    from: `Mishra Kushal <npmkushal@gmail.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transport.sendMail(mailOptions);
  //Because transport is defined  inside the sendEmail function, we can use it freely within the function.
};

module.exports = sendEmail;


//module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.from = `Mishra Kushal <npmkushal@gmail.com>`;
//   }
//
//   sendEmail() {
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject: `Welcome ${this.firstName}!`,
//       text: `Click here to access your account: ${this.url}`
//     };
//
//     return transport.sendMail(mailOptions);
//   }
// };

