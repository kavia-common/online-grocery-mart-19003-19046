'use strict';

const { query } = require('../config/db');
const { mapCartRowsToCart } = require('../models/cart');

/**
 * CartService
 * Handles CRUD operations for cart items and total calculation.
 */
class CartService {
  /**
   * Ensure a cart exists for a given session key (logical cartId). Creates if not exists.
   * Returns the cart row.
   */
  async ensureCart(cartKey) {
    const existing = await query('SELECT id, cart_key FROM carts WHERE cart_key = $1', [cartKey]);
    if (existing.rows.length > 0) return existing.rows[0];

    const inserted = await query(
      'INSERT INTO carts (cart_key) VALUES ($1) RETURNING id, cart_key',
      [cartKey]
    );
    return inserted.rows[0];
  }

  /**
   * Get cart rows for a cartKey (join items).
   */
  async getCart(cartKey) {
    await this.ensureCart(cartKey);
    const res = await query(
      `SELECT ci.product_id, ci.quantity, ci.unit_price
         FROM cart_items ci
         INNER JOIN carts c ON c.id = ci.cart_id
        WHERE c.cart_key = $1
        ORDER BY ci.created_at ASC`,
      [cartKey]
    );
    return mapCartRowsToCart(res.rows);
  }

  /**
   * Add product to cart (upsert behavior: if exists, increase quantity).
   * Requires productId, quantity, and unitPrice (from client or upstream product service).
   */
  async addItem(cartKey, productId, quantity, unitPrice) {
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      const err = new Error('Invalid input: productId and quantity (>=1) are required');
      err.status = 400;
      throw err;
    }
    const cart = await this.ensureCart(cartKey);

    // Try update existing
    const updateRes = await query(
      `UPDATE cart_items
          SET quantity = cart_items.quantity + $1
        WHERE cart_id = $2 AND product_id = $3
        RETURNING product_id`,
      [quantity, cart.id, productId]
    );

    if (updateRes.rowCount === 0) {
      // Insert new row - unitPrice required
      const price = Number(unitPrice);
      if (!Number.isFinite(price) || price < 0) {
        const err = new Error('Invalid input: unitPrice must be provided and >= 0 for new items');
        err.status = 400;
        throw err;
      }
      await query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [cart.id, productId, quantity, price]
      );
    }
    return this.getCart(cartKey);
  }

  /**
   * Update product quantity in cart (set explicit quantity).
   */
  async updateItem(cartKey, productId, quantity) {
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      const err = new Error('Invalid input: productId and quantity (>=1) are required');
      err.status = 400;
      throw err;
    }
    const cart = await this.ensureCart(cartKey);
    const res = await query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
      [quantity, cart.id, productId]
    );
    if (res.rowCount === 0) {
      const err = new Error('Product not found in cart');
      err.status = 404;
      throw err;
    }
    return this.getCart(cartKey);
  }

  /**
   * Remove product from cart.
   */
  async removeItem(cartKey, productId) {
    if (!productId) {
      const err = new Error('Invalid input: productId is required');
      err.status = 400;
      throw err;
    }
    const cart = await this.ensureCart(cartKey);
    const res = await query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );
    if (res.rowCount === 0) {
      const err = new Error('Product not found in cart');
      err.status = 404;
      throw err;
    }
    return this.getCart(cartKey);
  }
}

module.exports = new CartService();
