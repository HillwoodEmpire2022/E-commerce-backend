import express from 'express';
import dotenv from 'dotenv';

import { isLoggedIn } from '../middlewares/authentication.js';
import {
  cashout,
  checkout,
  flw_webhook,
  rw_mobile_money,
  webhook,
  flw_card,
  authorizeFlwOtpTransaction,
  validateFlwOtpTransaction,
} from '../controllers/payment.js';
import { restrictTo } from '../middlewares/authorization.js';

dotenv.config();
/**
 * @swagger
 * tags:
 *  name: Checkout
 *  description: Checkout APIs
 */

const router = express.Router();

router.post('/flw-webhook', flw_webhook);

/**
 * @swagger
 * /payments/checkout/card:
 *    post:
 *      summary: Checkout with Card
 *      tags: [Checkout]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      product:
 *                        type: string
 *                      seller:
 *                        type: string
 *                      quantity:
 *                        type: number
 *                      price:
 *                        type: number
 *                      productThumbnail:
 *                        type: string
 *                      variation:
 *                        type: object
 *                        properties:
 *                          color:
 *                            type: string
 *                          size:
 *                            type: string
 *                deliveryPreference:
 *                  type: string
 *                amount:
 *                  type: number
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                shippingAddress:
 *                  type: object
 *                  properties:
 *                    phoneNumber:
 *                      type: string
 *                    country:
 *                      type: string
 *                    city:
 *                      type: string
 *                    district:
 *                      type: string
 *                    sector:
 *                      type: string
 *                    cell:
 *                      type: string
 *                    village:
 *                      type: string
 *                    address:
 *                      type: object
 *                      properties:
 *                        street:
 *                          type: string
 *                        coordinates:
 *                          type: array
 *                          items:
 *                            type: number
 *                payment_payload:
 *                  $ref: '#/components/schemas/CardPayload'
 *      responses:
 *        200:
 *          description: Card payment/charge initiated with PIN authorization
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                   type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                      authorization:
 *                        type: object
 *                        properties:
 *                          mode:
 *                            type: string
 *                          fields:
 *                            type: array
 *                            items:
 *                              type: string
 *                      payment_payload:
 *                        type: object
 *                        properties:
 *                          card_number:
 *                            type: string
 *                          cvv:
 *                            type: string
 *                          expiry_month:
 *                            type: string
 *                          expiry_year:
 *                            type: string
 *                          currency:
 *                            type: string
 *                          amount:
 *                            type: string
 *                          redirect_url:
 *                            type: string
 *                          fullname:
 *                            type: string
 *                          email:
 *                            type: string
 *                          phone_number:
 *                            type: string
 *                example:
 *                  status: "success"
 *                  message: "Charge authorization data required"
 *                  data:
 *                    authorization:
 *                      mode: "pin"
 *                      fields: ["pin"]
 *                    payment_payload:
 *                      card_number: "1234567890"
 *                      cvv: "123"
 *                      expiry_month: "12"
 *                      expiry_year: "2023"
 *                      currency: "USD"
 *                      amount: "100"
 *                      redirect_url: "https://example.com"
 *                      fullname: "John Doe"
 *                      email: "john@example.com"
 *                      phone_number: "1234567890"
 *        201:
 *          description: Card payment/charge initiated with AVS authorization
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  message:
 *                  type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                      authorization:
 *                        type: object
 *                        properties:
 *                          mode:
 *                            type: string
 *                          fields:
 *                            type: array
 *                            items:
 *                              type: string
 *                      payment_payload:
 *                        type: object
 *                        properties:
 *                          card_number:
 *                            type: string
 *                          cvv:
 *                            type: string
 *                          expiry_month:
 *                            type: string
 *                          expiry_year:
 *                            type: string
 *                          currency:
 *                            type: string
 *                          amount:
 *                            type: string
 *                          redirect_url:
 *                            type: string
 *                          fullname:
 *                            type: string
 *                          email:
 *                            type: string
 *                          phone_number:
 *                            type: string
 *                example:
 *                  status: "success"
 *                  message: "Charge authorization data required"
 *                  data:
 *                    authorization:
 *                      mode: "avs_noauth"
 *                      fields: ["city", "address", "state", "country", "zipcode"]
 *                    payment_payload:
 *                      card_number: "1234567890"
 *                      cvv: "123"
 *                      expiry_month: "12"
 *                      expiry_year: "2023"
 *                      currency: "USD"
 *                      amount: "100"
 *                      redirect_url: "https://example.com"
 *                      fullname: "John Doe"
 *                      email: "john@example.com"
 *                      phone_number: "1234567890"
 *        302:
 *         description: Card payment/charge initiated with 3DS authorization (redirect to 3DS page)
 *
 */
router.post('/checkout/card', isLoggedIn, flw_card);
/**
 * @swagger
 * components:
 *   schemas:
 *     AuthorizationPayload:
 *       type: object
 *       properties:
 *         card_number:
 *           type: string
 *           example: "4556XXXXXXX"
 *         cvv:
 *           type: string
 *           example: "780"
 *         expiry_month:
 *           type: string
 *           example: "09"
 *         expiry_year:
 *           type: string
 *           example: "25"
 *         currency:
 *           type: string
 *           example: "RWF"
 *         amount:
 *           type: string
 *           example: "3320"
 *         redirect_url:
 *           type: string
 *           example: 'https://www.xxxxxxxx'
 *         fullname:
 *           type: string
 *           example: 'Joe Doe'
 *         email:
 *           type: string
 *           example: 'example@example.com'
 *         phone_number:
 *           type: string
 *           example: '25078XXXXXXXXXX'
 *         enckey:
 *           type: string
 *           example: 'FLWSECK_TEST46.....'
 *         tx_ref:
 *           type: string
 *           example: '9628f93-a3f5-4b16-8b38-9d28c87b195d'
 *     CardPayload:
 *       type: object
 *       properties:
 *         card_number:
 *           type: string
 *           example: "4556XXXXXXX"
 *         cvv:
 *           type: string
 *           example: "780"
 *         expiry_month:
 *           type: string
 *           example: "09"
 *         expiry_year:
 *           type: string
 *           example: "25"
 *         currency:
 *           type: string
 *           example: "RWF"
 *         amount:
 *           type: string
 *           example: "3320"
 *         redirect_url:
 *           type: string
 *           example: 'https://www.xxxxxxxx'
 *         fullname:
 *           type: string
 *           example: 'Joe Doe'
 *         email:
 *           type: string
 *           example: 'example@example.com'
 *         phone_number:
 *           type: string
 *           example: '25078XXXXXXXXXX'
 *     Address:
 *       type: object
 *       properties:
 *         city:
 *           type: string
 *           example: 'Kigali'
 *         address:
 *           type: string
 *           example: 'KK 9'
 *         state:
 *           type: string
 *           example: 'Rwanda'
 *         country:
 *           type: string
 *           example: 'RW'
 *         zipcode:
 *           type: string
 *           example: '00000'
 *     AvsNoAuthBody:
 *       type: object
 *       properties:
 *         auth_mode:
 *           type: string
 *           example: 'avs_noauth'
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         payment_payload:
 *           $ref: '#/components/schemas/AuthorizationPayload'
 *     PinAuthBody:
 *       type: object
 *       properties:
 *         auth_mode:
 *           type: string
 *           example: 'pin'
 *         pin:
 *           type: string
 *           example: '3310'
 *         payment_payload:
 *           $ref: '#/components/schemas/AuthorizationPayload'
 */

/**
 * @swagger
 * /payments/authorize-card:
 *   post:
 *     summary: Authorize card payment with PIN or AVS
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/PinAuthBody'
 *               - $ref: '#/components/schemas/AvsNoAuthBody'
 *     responses:
 *       200:
 *         description: Provide OTP to validate transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Provide OTP to validate transaction"
 *                 data:
 *                   type: object
 *                   properties:
 *                     flw_ref:
 *                       type: string
 *                       example: "FW_REF_1234567890"
 *                     validateUrl:
 *                       type: string
 *                       example: "api/v1/payments/validate-card"
 */
router.post('/authorize-card', isLoggedIn, authorizeFlwOtpTransaction);

/**
 * @swagger
 * /payments/validate-card:
 *   post:
 *     summary: Provide OTP to validate transaction
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              otp:
 *               type: number
 *               example: 12345
 *              flw_ref:
 *               type: string
 *               example: "FW_REF_1234567890"
 
 *     responses:
 *       100:
 *         description: Provide OTP to validate transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Order was paid successful"
 */
router.post('/validate-card', isLoggedIn, validateFlwOtpTransaction);

/**
 * @swagger
 * /payments/checkout/momo:
 *    post:
 *      summary: Checkout with mobile money
 *      tags: [Checkout]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      product:
 *                        type: string
 *                      seller:
 *                        type: string
 *                      quantity:
 *                        type: number
 *                      price:
 *                        type: number
 *                      productThumbnail:
 *                        type: string
 *                deliveryPreference:
 *                  type: string
 *                amount:
 *                  type: number
 *                email:
 *                  type: string
 *                phoneNumber:
 *                  type: string
 *                shippingAddress:
 *                  type: object
 *                  properties:
 *                    phoneNumber:
 *                      type: string
 *                    country:
 *                      type: string
 *                    city:
 *                      type: string
 *                    district:
 *                      type: string
 *                    sector:
 *                      type: string
 *                    cell:
 *                      type: string
 *                    village:
 *                      type: string
 *                    address:
 *                      type: object
 *                      properties:
 *                        street:
 *                          type: string
 *                        coordinates:
 *                          type: array
 *                          items:
 *                            type: number
 *      responses:
 *        200:
 *          description: Mobile Money payment/charge initiated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: string
 *                  data:
 *                    type: object
 *                    properties:
 *                      status:
 *                        type: string
 *                      message:
 *                        type: string
 *                      meta:
 *                        type: object
 *                        properties:
 *                          authorization:
 *                            type: object
 *                            properties:
 *                              redirect:
 *                                type: string
 *                              mode:
 *                                type: string
 *                example:
 *                  status: "success"
 *                  data:
 *                    status: "success"
 *                    message: "Charge initiated"
 *                    meta:
 *                      authorization:
 *                        redirect: "https://ravemodal-dev.herokuapp.com/captcha/verify/lang-en/............"
 *                        mode: "redirect"
 */
router.post('/checkout/momo', isLoggedIn, rw_mobile_money);
router.post('/cashout', isLoggedIn, restrictTo('admin'), cashout);

export default router;
