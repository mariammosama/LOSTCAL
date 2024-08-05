const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

const env=require("dotenv")
env.config({path:'config.env'})

module.exports = class Email {
  constructor(user,code) {
    this.to = user.email;
    this.firstName = user.username;
    this.code =code ;
    this.from = `yasminelbanna <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
   return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'yasminashraf153@gmail.com',
          pass: 'a i p j f m h f r v q g b r e t'
        }
             });

    

}
  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      code: this.code,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
   //    text: htmlToText.toString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions,function(error, info){
      if (error) {
          console.log(error);
      } else {
          console.log('Email sent: ' + info.response);
      }
  });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the LostCall Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
