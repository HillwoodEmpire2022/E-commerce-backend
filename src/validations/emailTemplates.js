export const activationEmailTemplate = (url, firstName) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            height: 250px;
            width: 100%;
            padding: 10px 0;
            background-color: #1D6F2B;
            color: white;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        
        .header h1{
        	height: 20%;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .button {
            cursor: pointer;
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #1D6F2B;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .logo-container{
         height: 80%;
        }
        
        .logo{
        	height: 100%;
        }
        .footer {
            text-align: center;
            padding: 10px 0;
            font-size: 12px;
            color: #777;
        }

        .activation-link{
            color: white;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="https://www.felitechnology.com/assets/logo-remove-16c79e75.png" alt="Feli Technology Logo" class="logo" />
            </div>
            <h1>Feli Express</h1>
        </div>
        
        <div class="content">
            <h2>Welcome, ${firstName}!</h2>
            <p>Thank you for signing up with us. Please verify your email address by clicking the button below:</p>
            <a href=${url} class="button" styles="color: white !important">Verify Email</a>
            <p>If the button doesn't work, please copy and paste the following URL into your browser:</p>
            <p>${url}</p>
            <p>If you didn't sign up, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Feli Technology. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};
