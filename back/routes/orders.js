// Expressフレームワークを読み込む
const express = require('express');
const router = express.Router();

// 注文データを読み込む
const orders = require('../models/orders');

// 注文書一覧API（GET）
router.get('/', (req, res) => {
  res.json(orders);
});

// 新しい注文書を作成するAPI（POST）
router.post('/', (req, res) => {
  const newOrder = req.body;
  // 必須項目のバリデーション
  if (!newOrder.customerId || !newOrder.customerName || !newOrder.orderDetail || !newOrder.orderDate) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }
  // 注文IDを自動採番
  newOrder.orderId = orders.length > 0 ? Math.max(...orders.map(o => o.orderId)) + 1 : 1;
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// このルーターをエクスポート
module.exports = router;
