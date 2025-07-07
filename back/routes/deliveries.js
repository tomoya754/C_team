// Expressフレームワークを読み込む
const express = require('express');
const router = express.Router();
const db = require('../db');

// 納品データを読み込む
const deliveries = require('../models/deliveries');

// 納品書一覧API（GET）
router.get('/', async (req, res) => {
  try {
    // deliveries, customers, order_details, ordersをJOINして必要な情報を取得
    const [rows] = await db.query(`
      SELECT 
        d.deliveryId,
        c.customerId,
        c.customerName,
        od.bookTitle AS orderDetail,
        c.phone,
        d.deliveryDate,
        d.totalAmount AS deliveryStatus, -- 仮でtotalAmountをdeliveryStatusに
        d.note
      FROM deliveries d
      JOIN customers c ON d.customerId = c.customerId
      LEFT JOIN delivery_details dd ON d.deliveryId = dd.deliveryId
      LEFT JOIN order_details od ON dd.orderDetailId = od.orderDetailId
      ORDER BY d.deliveryId DESC
    `);
    // deliveryStatusは本来別カラムがあればそちらを使う
    // orderDetailは複数行になる場合は工夫が必要
    res.json(rows.map(row => ({
      deliveryId: row.deliveryId,
      customerId: row.customerId,
      customerName: row.customerName,
      orderDetail: row.orderDetail,
      phone: row.phone,
      deliveryDate: row.deliveryDate,
      deliveryStatus: row.deliveryStatus, // 必要に応じて変換
      note: row.note
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データ取得エラー' });
  }
});

// 新しい納品書を作成するAPI（POST）
router.post('/', (req, res) => {
  const newDelivery = req.body;
  // 必須項目のバリデーション
  if (!newDelivery.customerId || !newDelivery.customerName || !newDelivery.orderDetail || !newDelivery.deliveryDate ) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }
  // 納品IDを自動採番
  newDelivery.deliveryId = deliveries.length > 0 ? Math.max(...deliveries.map(d => d.deliveryId)) + 1 : 1;
  deliveries.push(newDelivery);
  res.status(201).json(newDelivery);
});

// このルーターをエクスポート
module.exports = router;
