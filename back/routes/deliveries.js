// Expressフレームワークを読み込む
const express = require('express');
const router = express.Router();

// 納品データを読み込む
const deliveries = require('../models/deliveries');

// 納品書一覧API（GET）
router.get('/', (req, res) => {
  res.json(deliveries);
});

// 新しい納品書を作成するAPI（POST）
router.post('/', (req, res) => {
  const newDelivery = req.body;
  // 必須項目のバリデーション
  if (!newDelivery.customerId || !newDelivery.customerName || !newDelivery.orderDetail || !newDelivery.deliveryDate) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }
  // 納品IDを自動採番
  newDelivery.deliveryId = deliveries.length > 0 ? Math.max(...deliveries.map(d => d.deliveryId)) + 1 : 1;
  deliveries.push(newDelivery);
  res.status(201).json(newDelivery);
});

// このルーターをエクスポート
module.exports = router;
