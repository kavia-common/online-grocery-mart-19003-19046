'use strict';

const express = require('express');
const controller = require('../controllers/cartController');
const apiKeyMiddleware = require('../middleware/apiKey');
const validateCartItem = require('../middleware/validateCartItem');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management operations
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current cart details
 *     description: Retrieve the current cart including items and total. Uses X-CART-ID header if provided, else derives from API key.
 *     tags: [Cart]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cart details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized - API key missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/cart', apiKeyMiddleware, controller.getCart.bind(controller));

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add product to cart
 *     description: Add a product to the cart. If the product already exists, its quantity is incremented. Provide unitPrice when adding a new product.
 *     tags: [Cart]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *       400:
 *         description: Bad request - invalid input data
 *       401:
 *         description: Unauthorized - API key missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/cart', apiKeyMiddleware, validateCartItem, controller.addItem.bind(controller));

/**
 * @swagger
 * /cart:
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
 *       400:
 *         description: Bad request - invalid input data
 *       401:
 *         description: Unauthorized - API key missing or invalid
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.put('/cart', apiKeyMiddleware, validateCartItem, controller.updateItem.bind(controller));

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *             required:
 *               - productId
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *       400:
 *         description: Bad request - invalid input data
 *       401:
 *         description: Unauthorized - API key missing or invalid
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.delete('/cart', apiKeyMiddleware, controller.removeItem.bind(controller));

module.exports = router;
