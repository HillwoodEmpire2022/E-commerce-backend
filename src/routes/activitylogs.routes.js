import express from 'express';
import { isLoggedIn } from '../middlewares/authentication.js';
import { getActivityLogs } from '../controllers/activity.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Activity Logs
 *  description: Activity Logs APIs
 */

/**
 * @swagger
 * /activity-logs:
 *    get:
 *      summary: Get all products.
 *      tags: [Activity Logs]
 *      parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *       - in: query
 *         name: sort
 *         schema:
 *          type: string
 *          default: createdAt
 *         description: The field to sort the results by.
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         description: A comma-separated list of fields to include in the response.
 *      responses:
 *        200:
 *          description: The array of all products.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *
 */
router.get('/', isLoggedIn, getActivityLogs);

export default router;
