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

router.post('/', isLoggedIn, checkout);

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
 *                  type: object
 *                  properties:
 *                    card_number:
 *                      type: string
 *                    cvv:
 *                      type: string
 *                    expiry_month:
 *                      type: string
 *                    expiry_year:
 *                      type: string
 *                    currency:
 *                      type: string
 *                    amount:
 *                      type: string
 *                    redirect_url:
 *                      type: string
 *                    fullname:
 *                      type: string
 *                    email:
 *                      type: string
 *                    phone_number:
 *                      type: string
 *      responses:
 *        100:
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
 *        102:
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
router.post('/checkout/card', flw_card);
router.post('/authorize-card', authorizeFlwOtpTransaction);
router.post('/validate-card', validateFlwOtpTransaction);

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
router.post('/webhook', webhook);

export default router;
