const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/order_details/undelivered?customerId=xxx
router.get('/undelivered', async (req, res) => {
    const customerId = req.query.customerId;
    if (!customerId) return res.status(400).json({ error: 'customerId required' });
    const sql = `
        SELECT od.orderDetailId, od.orderId, od.bookTitle, od.undeliveredQuantity, od.unitPrice, o.orderDate
        FROM order_details od
        JOIN orders o ON od.orderId = o.orderId
        WHERE o.customerId = ? AND od.undeliveredQuantity > 0
        ORDER BY o.orderDate DESC, od.orderDetailId DESC
    `;
    try {
        const results = await db.query(sql, [customerId]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: 'DB error' });
    }
});

module.exports = router;
