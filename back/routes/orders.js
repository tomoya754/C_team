// Expressフレームワークを読み込む
const express = require('express');
const router = express.Router();

// データベース接続
const db = require('../db');

// 注文データを読み込む
const orders = require('../models/orders');

// 注文書一覧API（GET）
router.get('/', async (req, res) => {
  try {
    // orders, customers, order_detailsをJOINして必要な情報を取得
    const [rows] = await db.query(`
      SELECT 
        o.orderId,
        c.customerId,
        c.customerName,
        od.bookTitle AS orderDetail,
        c.phone,
        o.orderDate,
        o.totalAmount
      FROM orders o
      JOIN customers c ON o.customerId = c.customerId
      LEFT JOIN order_details od ON o.orderId = od.orderId
      ORDER BY o.orderId DESC
    `);
    res.json(rows.map(row => ({
      orderId: row.orderId,
      customerId: row.customerId,
      customerName: row.customerName,
      orderDetail: row.orderDetail,
      phone: row.phone,
      orderDate: row.orderDate,
      totalAmount: row.totalAmount
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データ取得エラー' });
  }
});

// 新しい注文書を作成するAPI（POST）
router.post('/', async (req, res) => {
  const { customerId, orderDate, orderDetails } = req.body;
  // orderDetails: [{ bookTitle, quantity, unitPrice }, ...]
  if (!customerId || !orderDate || !Array.isArray(orderDetails) || orderDetails.length === 0) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }
  const db = require('../db');
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // 注文書本体を登録
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customerId, orderDate) VALUES (?, ?)',

      [customerId, orderDate]
    );
    const orderId = orderResult.insertId;
    // 注文明細を登録
    for (const detail of orderDetails) {
      await connection.query(
        'INSERT INTO order_details (orderId, bookTitle, quantity, unitPrice) VALUES (?, ?, ?, ?)',

        [orderId, detail.bookTitle, detail.quantity, detail.unitPrice]
      );
    }
    await connection.commit();
    res.status(201).json({ orderId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '登録エラー' });
  } finally {
    connection.release();
  }
});

// このルーターをエクスポート
module.exports = router;
