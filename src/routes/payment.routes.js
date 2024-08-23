import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';

import {
  authorizeFlwOtpAndAvsTransaction,
  cashout,
  flw_card,
  flw_webhook,
  pay,
  retry_card_payment,
  retry_momo_payment,
  rw_mobile_money,
  validateFlwOtpTransaction,
} from '../controllers/payment.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';
import { randomStringGenerator } from '../utils/randomStringGenerator.js';

dotenv.config();
/**
 * @swagger
 * tags:
 *  name: Checkout
 *  description: Checkout APIs
 */

const router = express.Router();

router.post('/flw-webhook', flw_webhook);

// Retry momo payment
/**
 * @swagger
 * /payments/retry-momo:
 *   post:
 *     summary: Retry momo payment
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               momo_payload:
 *                 type: object
 *                 properties:
 *                   tx_ref:
 *                     type: string
 *                     example: "012ddcfd-3c9e-471c-a437-07c87a3d777d"
 *                   order_id:
 *                     type: string
 *                     example: "668f816cf6c62f9f42beb7ab"
 *                   amount:
 *                     type: number
 *                     example: 197
 *                   currency:
 *                     type: string
 *                     example: "RWF"
 *                   email:
 *                     type: string
 *                     example: "dav.ndungutse@gmail.com"
 *                   phone_number:
 *                     type: string
 *                     example: "0785283007"
 *                   fullname:
 *                     type: string
 *                     example: "Eric NDUNGUTSE"
 *     responses:
 *       200:
 *         description: Successful response
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
 *                   example: "Redirecting to otp page"
 *                 data:
 *                   type: object
 *                   properties:
 *                     redirect:
 *                       type: string
 *                       example: "https://ravemodal-dev.herokuapp.com/captcha/verify/lang-en/127515:6a21b3f5c457ea1e5c0da415aa929a53"
 */
router.post('/retry-momo', isLoggedIn, retry_momo_payment);

// Retry card payment
/**
 * @swagger
 * /payments/retry-card:
 *    post:
 *      summary: Retry Card Payment
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
 *                order_id:
 *                  type: string
 *                payload:
 *                  type: object
 *                  properties:
 *                    card_number:
 *                      type: string
 *                      example: "1234567890123456"
 *                    cvv:
 *                      type: string
 *                      example: "123"
 *                    expiry_month:
 *                      type: string
 *                      example: "12"
 *                    expiry_year:
 *                      type: string
 *                      example: "2023"
 *                    currency:
 *                      type: string
 *                      example: "USD"
 *                    amount:
 *                      type: string
 *                      example: "100"
 *                    fullname:
 *                      type: string
 *                      example: "John Doe"
 *                    email:
 *                      type: string
 *                      example: "john@example.com"
 *                    phone_number:
 *                      type: string
 *                      example: "1234567890"
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
router.post('/retry-card', isLoggedIn, retry_card_payment);

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
router.post('/authorize-card', isLoggedIn, authorizeFlwOtpAndAvsTransaction);

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

/**
 * @swagger
 * /payments/pay:
 *   post:
 *     summary: Create a new order
 *     tags: [Checkout]
 *     description: This endpoint allows the creation of a new order.
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: order
 *         description: Order object that needs to be added
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               example: 100
 *             email:
 *               type: string
 *               example: "dav.ndungutse@gmail.com"
 *             phoneNumber:
 *               type: string
 *               example: "0785283007"
 *             shippingAddress:
 *               type: object
 *               properties:
 *                 district:
 *                   type: string
 *                   example: "Nyarugenge"
 *                 sector:
 *                   type: string
 *                   example: "nyarugenge"
 *                 street:
 *                   type: string
 *                   example: "kk 123 street"
 *               required:
 *                 - district
 *                 - sector
 *                 - street
 *             name:
 *               type: string
 *               example: "John Doe"
 *             deliveryPreference:
 *               type: string
 *               example: "pickup"
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product:
 *                     type: string
 *                     example: "66a8cb3fede456f6b498612e"
 *                   seller:
 *                     type: string
 *                     example: "6656eae68043c9d406c82217"
 *                   quantity:
 *                     type: integer
 *                     example: 1
 *                   price:
 *                     type: number
 *                     example: 100
 *                   productThumbnail:
 *                     type: string
 *                     example: "https://res.cloudinary.com/dccszmlim/image/upload/v1722338062/felitechnology_E-commerce_HAHA/p9gewws1myd94mjqwlu9.png"
 *                 required:
 *                   - product
 *                   - seller
 *                   - quantity
 *                   - price
 *                   - productThumbnail
 *           required:
 *             - amount
 *             - email
 *             - phoneNumber
 *             - shippingAddress
 *             - name
 *             - deliveryPreference
 *             - items
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 */

router.post('/pay', isLoggedIn, pay);

export default router;
