
const nodemailer = require("nodemailer")


	const transporter = nodemailer.createTransport({
		host: "smtp-relay.brevo.com",
		port: 587, // Use 465 for SSL or 587 for TLS
        secure: false, // Set to true for port 465
		auth: {
			user: "816128001@smtp-brevo.com",
			pass: "gY2aRCZIwzd4Q6kB",//21b569PqnD
		},
	});

    const sender = "kiplangatsang08@gmail.com"

module.exports = {transporter, sender}