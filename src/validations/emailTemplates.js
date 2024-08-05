export const activationEmailTemplate = (url, firstName) => {
  return `

<div style="background-color: #f4f4f4; height:100vh; padding-top: 50px">
    <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
                <h1>Feli Express</h1>
        </div>

        <div style="padding: 0px 30px 20px 30px">
            <h2>Welcome, ${firstName}!</h2>
            <p>Thank you for signing up with us. Please verify your email address by clicking the button below:</p>
            <a href=${url}  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">Verify your email</a>
            <p>If the button doesn't work, please copy and paste the following URL into your browser:</p>
            <p>${url}</p>
            <p>If you didn't sign up, please ignore this email.</p>
        </div>
    </div>
</div>
    `;
};

export const forgotPasswordEmailTemplate = (url, firstName) => {
  return `
<div style="background-color: #f4f4f4; height:100vh; padding-top: 50px">
	   <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
   
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
            <h1>Feli Express</h1>
        </div>
        
        <div style="padding: 0px 30px 20px 30px">
            <h2 style="color:blue"> Hi ${firstName},</h2>
            <p>Click the button below to reset your password. If you didn't ask for this, just ignore this email</p>
            <a href=${url}  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">Reset password</a> 
        </div>
        
    </div>
</div>
    `;
};
