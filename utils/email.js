const nodemailer = require('nodemailer');
const  pug = require("pug");
const htmlToText = require('html-to-text');

module.exports = class Email{
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split('')[0]; 
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`; 
  }

  createTransport(){
    if(process.env.NODE_ENV ==='production'){
      //use SENDGRID.
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth:{
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }

    //My actual credentials that i used to make sandgrid's sandbox account.
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth:{
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })

  }

async send(template, subject){
 const html =  pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
  firstName: this.firstName,
  url: this.url,
  subject
 });

 const mailOptions = {
  from: this.from,
  to: this.to,
  subject,
  html,
  text: htmlToText.htmlToText(html)
 };
 await this.createTransport().sendMail(mailOptions);
}

async sendWelcome(){
  await this.send('welcome', 'Welcome to the natours family!');
} 

async sendForgotPassword(){
  await this.send('passwordReset', 'Forgot your password? Oh! For sure!!!');
}

}


// const sendEmail = async options => {
//   // Looking to send emails in production? Check out our Email API/SMTP product!
//   // The details below are for the mailtrap.io service. These credentials are not sent to the client. Just used for connecting to the mailtrap.io service.
//   const transport = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT, 
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
//   //
//   const mailOptions = {
//     from: `Mishra Kushal <no-reply@mishrakushal.com.np>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   };

//   await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;



