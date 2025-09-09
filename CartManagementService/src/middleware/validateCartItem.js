'use strict';

/**
 * Validate request body matches CartItem schema minimally.
 * Allows productId as string and quantity as integer >=1.
 * For POST (add), unitPrice may be required when item is new; the service checks it.
 */
module.exports = function validateCartItem(req, res, next) {
  const { productId, quantity } = req.body || {};
  if (typeof productId !== 'string' || productId.trim().length === 0) {
    return res.status(400).json({ code: 400, message: 'productId must be a non-empty string' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ code: 400, message: 'quantity must be an integer >= 1' });
  }
  next();
};
