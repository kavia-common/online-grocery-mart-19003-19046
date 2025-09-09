'use strict';

/**
 * Cart model helpers to map DB rows into API responses and compute totals safely.
 */

// PUBLIC_INTERFACE
function mapCartRowsToCart(rows) {
  /** Map rows from cart_items join to a Cart object with items and computed total. */
  const items = [];
  let total = 0.0;

  for (const r of rows) {
    const price = Number(r.unit_price || 0);
    const qty = Number(r.quantity || 0);
    const lineTotal = price * qty;
    total += lineTotal;

    items.push({
      productId: String(r.product_id),
      quantity: qty,
      unitPrice: price,
      lineTotal: Number(lineTotal.toFixed(2))
    });
  }

  return {
    items,
    total: Number(total.toFixed(2))
  };
}

module.exports = {
  mapCartRowsToCart
};
