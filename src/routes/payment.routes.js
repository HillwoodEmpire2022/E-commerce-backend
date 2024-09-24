import dotenv from 'dotenv';
import express from 'express';

import { flw_webhook, pay, retryPay } from '../controllers/payment.js';
import { isLoggedIn } from '../middlewares/authentication.js';

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
 * /payments/pay:
 *   post:
 *     summary: Place an order
 *     tags: [Checkout]
 *     description: This endpoint allows the creation of a new order.
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                amount:
 *                  type: number
 *                  example: 100
 *                email:
 *                  type: string
 *                  example: "dav.ndungutse@gmail.com"
 *                phoneNumber:
 *                  type: string
 *                  example: "0785283007"
 *                shippingAddress:
 *                  type: object
 *                  properties:
 *                    district:
 *                      type: string
 *                      example: "Nyarugenge"
 *                    sector:
 *                      type: string
 *                      example: "nyarugenge"
 *                    street:
 *                      type: string
 *                      example: "kk 123 street"
 *                name:
 *                  type: string
 *                  example: "John Doe"
 *                deliveryPreference:
 *                  type: string
 *                  example: "pickup"
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      product:
 *                        type: string
 *                        example: 66a8cb3fede456f6b498612e
 *                      seller:
 *                        type: string
 *                        example: 6656eae68043c9d406c82217
 *                      quantity:
 *                        type: number
 *                        example: 1
 *                      price:
 *                        type: number
 *                        example: 100
 *                      productThumbnail:
 *                        type: string
 *                        example: "https://res.cloudinary.com/dccszmlim/image/upload/v1722338062/felitechnology_E-commerce_HAHA/p9gewws1myd94mjqwlu9.png"
 *
 *     responses:
 *      200:
 *       description: Order created successfully
 *      content:
 *       application/json:
 */

router.post('/pay', isLoggedIn, pay);

// Retry
/**
 * @swagger
 * /retry/{orderId}:
 *    get:
 *      summary: Retry payment by order ID
 *      tags: [Checkout]
 *      parameters:
 *        - in: path
 *          name: orderId
 *          schema:
 *            type: string
 *          required: true

 *      responses:
 *        200:
 *          description: Payment Link
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                 status:
 *                  type: string
 *                  example: success,
 *                 message:
 *                  type: string
 *                  example: 'Hosted Link'
 *                 data:
 *                  type: object
 *                  properties:
 *                   link:
 *                    type: string
 *                    example: 'https://ravemodal-dev.herokuapp.com/captcha/ve......'
 */
router.get('/retry/:orderId', isLoggedIn, retryPay);

export default router;
