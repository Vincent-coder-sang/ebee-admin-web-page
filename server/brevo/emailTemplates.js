const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email | Ebee</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      padding: 30px 20px;
      color: #ffffff;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      display: inline-block;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .verification-code {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 3px;
      color: #2563eb;
      background-color: #eff6ff;
      padding: 20px 40px;
      border-radius: 8px;
      display: inline-block;
      margin: 25px 0;
      font-family: 'Courier New', monospace;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #64748b;
      margin-top: 30px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .text-muted {
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ebee</div>
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Dear {name},</p>
      <p>Welcome to Ebee! To complete your registration, please use the following verification code:</p>
      <div class="verification-code">{verificationCode}</div>
      <p>Enter this code in the verification page to activate your account.</p>
      <p class="text-muted">This code will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this, please ignore this email or contact support.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebee. All rights reserved.</p>
      <p>This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful | Ebee</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #10b981, #059669);
      padding: 30px 20px;
      color: #ffffff;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      display: inline-block;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .success-icon {
      font-size: 60px;
      color: #10b981;
      margin: 25px 0;
    }
    ul {
      text-align: left;
      margin: 20px auto;
      max-width: 400px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #64748b;
      margin-top: 30px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .text-muted {
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ebee</div>
      <h1>Password Reset Successful</h1>
    </div>
    <div class="content">
      <div class="success-icon">✓</div>
      <p>Hello {name},</p>
      <p>Your Ebee account password has been successfully updated.</p>
      
      <p>For your security, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Enabling two-factor authentication</li>
        <li>Updating your password regularly</li>
      </ul>
      
      <p>If you didn't make this change, please <a href="mailto:support@ebee.com" style="color: #2563eb;">contact our support team</a> immediately.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebee. All rights reserved.</p>
      <p>This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password | Ebee</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      padding: 30px 20px;
      color: #ffffff;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      display: inline-block;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #64748b;
      margin-top: 30px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .text-muted {
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ebee</div>
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hello {name},</p>
      <p>We received a request to reset your Ebee account password. Click the button below to proceed:</p>
      
      <a href="{resetLink}" class="button">Reset Password</a>
      
      <p class="text-muted">This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebee. All rights reserved.</p>
      <p>This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Ebee</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      padding: 40px 20px;
      color: #ffffff;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 15px;
      display: inline-block;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .welcome-image {
      max-width: 200px;
      margin: 20px auto;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 25px 0;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #64748b;
      margin-top: 30px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ebee</div>
      <h1>Welcome, {name}!</h1>
    </div>
    <div class="content">
      <p>We're thrilled to have you join the Ebee community!</p>
      
      <p>Your account is now ready to use. Here's what you can do next:</p>
      
      <a href="{dashboardLink}" class="cta-button">Go to Your Dashboard</a>
      
      <p>If you have any questions, our support team is always happy to help.</p>
      <p>Happy shopping with Ebee!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebee. All rights reserved.</p>
      <p>This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

const NOTIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation | Ebee</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #334155;
      line-height: 1.6;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      padding: 30px 20px;
      color: #ffffff;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 10px;
      display: inline-block;
    }
    .content {
      padding: 30px;
      text-align: left;
    }
    .order-details {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .order-total {
      font-weight: bold;
      font-size: 18px;
      margin-top: 15px;
      text-align: right;
    }
    .footer {
      font-size: 12px;
      text-align: center;
      color: #64748b;
      margin-top: 30px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #d97706;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Ebee</div>
      <h1>Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear {userName},</p>
      <p>Thank you for your order with Ebee! We're preparing your items for shipment.</p>
      
      <div class="order-details">
        <h3>Order #{orderNumber}</h3>
        {notificationContent}
        <div class="order-total">Total: {orderTotal}</div>
      </div>
      
      <p>You'll receive another email when your order ships. Expected delivery within 72 working hours.</p>
      
      <a href="{orderLink}" class="button">View Your Order</a>
      
      <p>If you have any questions about your order, please contact our support team.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Ebee. All rights reserved.</p>
      <p>This is an automated message - please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  NOTIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
};