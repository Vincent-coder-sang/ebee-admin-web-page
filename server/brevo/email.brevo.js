const {
  NOTIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} = require("./emailTemplates");
const { transporter, sender } = require("./brevo.config");


// Utility function for replacing placeholders
const applyTemplate = (template, data) => {
  return Object.keys(data).reduce(
    (acc, key) => acc.replace(new RegExp(`{${key}}`, "g"), data[key]),
    template
  );
};

const sendVerificationEmail = async (email, verificationCode, name) => {
  const recipient = email;
  try {
    const emailContent = VERIFICATION_EMAIL_TEMPLATE
    .replace(/{name}/g, name)
  .replace(/{verificationCode}/g, verificationCode)
  ;


    const info = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Verify Your Email.",
      html: emailContent,
    });

    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.error(`Error sending verification email`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  const recipient = email;

  const welcomeContent = WELCOME_EMAIL_TEMPLATE.replace("{name}", name);
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Welcome!",
      html: welcomeContent, // Include the actual content or template here
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
  const recipient = email;

  try {
    const emailContent = PASSWORD_RESET_REQUEST_TEMPLATE
      .replace(/{resetLink}/g, resetLink)
      .replace(/{name}/g, name);

    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: emailContent,
      category: "Password Reset",
    });

  } catch (error) {
    throw new Error(`Error sending password reset email: ${error}`);
  }
};


const sendResetSuccessEmail = async (email, name) => {
  const recipient = email;

  try {
    const response = await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace(/{name}/g, name),
      category: "Password Reset",
    });

    console.log("Password reset success email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

const sendNotificationEmail = async (
  userEmail,
  userName,
  notificationContent
) => {
  const personalizedTemplate = NOTIFICATION_EMAIL_TEMPLATE
  .replace(/{userName}/g, userName)
  .replace(/{notificationContent}/g, notificationContent);

  const recipient = userEmail;
  try {
    const response = await transporter.sendMail({
      from: sender, // Sender email
      to: recipient, // Recipient email
      subject: "Order placed successfully.",
      html: personalizedTemplate, // Use the personalized template
      // category: 'Notification',
    });

    console.log("Notification email sent successfully", response);
  } catch (error) {
    console.error("Error sending notification email", error);
    throw new Error(`Error sending notification email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendResetSuccessEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
};
