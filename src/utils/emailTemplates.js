import dateFormatter from '../validations/dateFormatter.js';

export const activationEmailTemplate = (url, firstName, verificationCode) => {
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
            <p>If you are signing up with Mobile App, provide the following code <span style="cursor: pointer;display:inline-block;padding: 2px 4px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 14px;">${verificationCode}</span> in the form provided while signing up</p>
            
            <p>If the button doesn't work, please copy and paste the following URL into your browser:</p>
            <p>${url}</p>
            <p>If you didn't sign up, please ignore this email.</p>
        </div>
    </div>
</div>
    `;
};

export const forgotPasswordEmailTemplate = (url, firstName, otp) => {
  return `
<div style="background-color: #f4f4f4; height:100vh; padding-top: 50px">
	   <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
   
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
            <h1>Feli Express</h1>
        </div>
        
        <div style="padding: 0px 30px 20px 30px">
            <h2> Hi ${firstName},</h2>
            <p>Click the button below to reset your password. If you didn't ask for this, just ignore this email</p>
            <a href=${url}  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">Reset password</a> 

            <p>If you are resetting password from a mobile app, enter the following code <span style="cursor: pointer;display:inline-block;padding: 2px 4px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 14px;">${otp}</span> in the form provided.</p>
        </div>
        
    </div>
</div>
    `;
};

/**
 * Generates an order notification email template.
 *
 * @param {string} firstName - The first name of the recipient.
 * @param {string} orderId - The ID of the order.
 * @param {string} orderDate - The date of the order.
 * @param {string} url - The URL to track the order.
 * @param {Array} items - List of ordered items.
 * @returns {string} The generated email template.
 */
export const orderNotificationEmailTemplate = (firstName, orderId, orderDate, url, items, amount) => {
  return `
  <div style="background-color: #f4f4f4; padding:10px 0 50px 0px; padding-top: 50px; font-family: sans-serif">
  
  <div style="width:90%;max-width: 700px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
      <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
              <h1>Feli Express</h1>
      </div>
      <div style="padding: 10px">
      <h4>Dear ${firstName},</h4>
      <p>Thank you for shopping with us! We're excited to let you know that we’ve received your order. Below are the details of your purchase:</p>
  
      <p>
          <span style="font-weight:bold">Order ID:</span> ${orderId} <br/>
          <span style="font-weight:bold">Order Date:</span> ${dateFormatter(new Date(orderDate))} <br/>
      </p>
  
  
      <h2 style="color: #437a4c; margin-bottom:10px">Ordered Products</h2>
  
      <div style="display:flex; flex-wrap: wrap; gap: 20px;">
  
          ${items.map((item) => {
            return `<div style="display:flex; align-items:start;gap:15px">
              <div style="padding: 5px;border-radius: 5px; border: 1px solid #ccc;">
                  <img src="${
                    item.productThumbnail
                  }" style="width: 100px; border-radius: 5px; height: 100px; object-fit: cover;" alt="${
              item.product.name
            }"/>
              </div>
              <div style="margin-left: 10px">
                  <span style="display:block; margin-bottom: 3px"><strong>Name: </strong>${item.product.name}</span>
                  <span style="display:block; margin-bottom: 3px"><strong>Quantity: </strong>${item.quantity}</span>
                  <span style="display:block; margin-bottom: 3px"><strong>Price: </strong>${item.price}</span>
                  <span style="display:block; margin-bottom: 3px"><strong>Total price: </strong>${
                    item.price * item.quantity
                  }</span>
              </div>
          </div>`;
          })}
  
  
          </div>
      <hr style="height: 1px; background-color: #f4f4f4; width:100%; border: 0; margin-top: 20px; margin-bottom:20px"/>
      <span style="display:block; margin-bottom:10px"><span style="font-weight:bold; display:inline-block">Total Amount:</span> ${amount} Frw</span>
      <a href=${url}  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">Track Your Order</a>
      </div>
  </div>
  </div>
    `;
};

export const securityActivityEmailTemplate = (options) => {
  return `
  <div style="background-color: #f4f4f4; padding: 50px 0px; font-family: sans-serif; color: #444746;">
	   <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
            <h1>Feli Express</h1>
        </div>
        <div style="padding: 0px 30px 20px 30px; text-align:center">
            <h2>${options?.text?.heading}</h2>
            <p style="line-height:20px">${options?.text?.message}<p>
            <a href=${options?.text?.button?.url}  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">${options?.text?.button?.text}</a> 
        </div>
    </div>
</div>
    `;
};

export const signInOtpEmailTemplate = (otp) => {
  return ` <div style="background-color: #f4f4f4; padding: 50px 0px; font-family: sans-serif; color: #444746;">
	   <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
            <h1>Feli Express</h1>
        </div>
        <div style="padding: 0px 30px 35px 30px; text-align:center">
            <h2>Sign in OTP</h2>
            <p style="line-height:20px">Please use the code below to complete sign in.</p>
            <p style="text-align:center;width:100%;color:#444746; font-size: 26px; margin:0; font-weight: light">${otp}</p>
        </div>
    </div>
</div>`;
};

export const adminOrderNotificationEmailTemplate = (options) => {
  const nodeEnv = process.env.NODE_ENV;
  const clientUrl =
    nodeEnv === 'production'
      ? process.env.CLIENT_PRODUCTION_URL
      : nodeEnv === 'development'
      ? process.env.CLIENT_DEV_URL
      : process.env.CLIENT_STAGING_URL;
  return `
    <div style="background-color: #f4f4f4; padding: 50px 0px; font-family: sans-serif; color: #444746;">
	   <div class="container" style="width:90%;max-width: 600px;margin: 0 auto;background-color:#ffffff; box-shadow:0 0 10px rgba(0, 0, 0, 0.1)">
        <div class="header" style="text-align:center;width:100%;padding:10px 0;background-color:#1D6F2B;color:white;">
            <h1>Feli Express</h1>
        </div>
        <div style="padding: 0px 30px 35px 30px; text-align:center">
            <h2>A New Order</h2>
            <p style="line-height:20px; padding: 0px 15px">A new order has just been placed on the store! Click on the button below for more details.</p>
            <a href="${clientUrl}/user/order/${options.orderId}"  style="cursor: pointer;display:inline-block;padding:10px 20px;background-color: #1D6F2B;color:white;text-decoration: none;border-radius: 5px;font-size: 16px;">Track order</a> 
        </div>
    </div>
</div>`;
};
