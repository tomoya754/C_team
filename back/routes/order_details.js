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

// PUT /api/order_details/update_quantity
router.put('/update_quantity', async (req, res) => {
    const updates = req.body; // [{ orderDetailId, quantity }]
    if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const sql = `
        UPDATE order_details
        SET undeliveredQuantity = undeliveredQuantity - ?
        WHERE orderDetailId = ? AND undeliveredQuantity >= ?
    `;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const update of updates) {
            const { orderDetailId, quantity } = update;
            if (!orderDetailId || !quantity || quantity <= 0) {
                throw new Error('Invalid update data');
            }
            await connection.query(sql, [quantity, orderDetailId, quantity]);
        }
        await connection.commit();
        res.json({ success: true });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: 'DB error', details: err.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
