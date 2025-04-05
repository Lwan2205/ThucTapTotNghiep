    const nodemailer = require('nodemailer');
    require('dotenv').config()

    const sendEmail = async (options) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS_EMAIL,
            },
        });

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        await transporter.sendMail(mailOptions);
    };

    module.exports = sendEmail;
