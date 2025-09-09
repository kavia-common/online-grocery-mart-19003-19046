'use strict';

const cartService = require('../services/cart');

/**
 * CartController
 * Provides handlers for cart endpoints.
 */
class CartController {
  // PUBLIC_INTERFACE
  async getCart(req, res) {
    /** Get current cart details for the caller's session key. */
    try {
      const cartKey = getCartKey(req);
      const cart = await cartService.getCart(cartKey);
      return res.status(200).json(cart);
    } catch (err) {
      handleError(err, res);
    }
  }

  // PUBLIC_INTERFACE
  async addItem(req, res) {
    /** Add product to cart; on existing item increments quantity. */
    try {
      const cartKey = getCartKey(req);
      const { productId, quantity, unitPrice } = req.body || {};
      const cart = await cartService.addItem(cartKey, productId, quantity, unitPrice);
      return res.status(201).json(cart);
    } catch (err) {
      handleError(err, res);
    }
  }

  // PUBLIC_INTERFACE
  async updateItem(req, res) {
    /** Update quantity for an existing product in cart. */
    try {
      const cartKey = getCartKey(req);
      const { productId, quantity } = req.body || {};
      const cart = await cartService.updateItem(cartKey, productId, quantity);
      return res.status(200).json(cart);
    } catch (err) {
      handleError(err, res);
    }
  }

  // PUBLIC_INTERFACE
  async removeItem(req, res) {
    /** Remove product from cart. */
    try {
      const cartKey = getCartKey(req);
      const { productId } = req.body || {};
      const cart = await cartService.removeItem(cartKey, productId);
      return res.status(200).json(cart);
    } catch (err) {
      handleError(err, res);
    }
  }
}

function getCartKey(req) {
  // Use a simple approach: one cart per API key holder.
  // Prefer a dedicated header X-CART-ID if provided, otherwise derive from API key.
  const explicit = req.header('X-CART-ID');
  if (explicit && explicit.trim().length > 0) return explicit.trim();

  const apiKey = req.header('X-API-KEY') || 'anonymous';
  return `cart:${apiKey}`;
}

function handleError(err, res) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(status).json({ code: status, message });
}

module.exports = new CartController();
