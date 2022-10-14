const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "emailforpython26@gmail.com", // generated ethereal user
    pass: process.env.EMAIL_PASSWORD, // generated ethereal password
  },
});

exports.sendEmail = async (details) => {
  return transporter.sendMail({
    from: "emailforpython26@gmail.com", // sender address
    to: details.email, // list of receivers
    subject: "Password Reset",
    html: `<!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      </head>
      <body style="font-family: sans-serif; text-align: center; color: #000" >
        <div style="display: block; margin: auto; max-width: 600px;" class="main">
          <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px ">Link expires after 30 minutes.</h1>
          <div> 
                <p><a class="button-58" role="button" style=" background-color: #06f; color: white; padding: 12px 20px; text-decoration: none;" href="https://tektalk.vercel.app/reset-password?token=${details.token}">Reset Password</a></p>
          </div>
        </div>
        <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
      </body>
    </html>`,
  });
};
