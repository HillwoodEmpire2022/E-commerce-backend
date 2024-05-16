import express from 'express';
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getBrand,
  updateBrand,
} from '../controllers/brand.js';
import { isLoggedIn } from '../middlewares/authentication.js';
import { restrictTo } from '../middlewares/authorization.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: API endpoints for managing brands
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Returns an array of all brands
 */
router.get('/', getAllBrands);

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               productClass:
 *                 type: string
 *             required:
 *               - name
 *               - productClass
 *     responses:
 *       201:
 *         description: Returns the created brand
 */
router.post('/', createBrand);

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Get a brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the brand
 *     responses:
 *       200:
 *         description: Returns the brand with the specified ID
 */
router.get('/:id', getBrand);

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Update a brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the brand
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               productClass:
 *                 type: string
 *             required:
 *               - name
 *               - productClass
 *     responses:
 *       200:
 *         description: Returns the updated brand
 */
router.put('/:id', updateBrand);

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the brand
 *     responses:
 *       204:
 *         description: Brand successfully deleted
 */
router.delete('/:id', deleteBrand);

export default router;
