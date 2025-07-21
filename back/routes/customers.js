const express = require('express');
const db = require('../db');
const router = express.Router();

// 顧客IDから顧客名・住所を取得するAPI
router.get('/:customerId', async (req, res) => {
  const customerId = req.params.customerId;
  try {
    const [rows] = await db.query('SELECT customerName, address FROM customers WHERE customerId = ?', [customerId]);
    if (rows.length === 0) return res.status(404).json({ error: '顧客が見つかりません' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DBエラー' });
  }
});

module.exports = router;
