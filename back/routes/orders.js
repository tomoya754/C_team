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
    // 注文書本体＋顧客情報
    const [orders] = await db.query(`
      SELECT 
        o.orderId,
        c.customerId,
        c.customerName,
        c.phone,
        o.orderDate,
        o.totalAmount
      FROM orders o
      JOIN customers c ON o.customerId = c.customerId
      ORDER BY o.orderId DESC
    `);
    // 各注文の明細を取得
    for (const order of orders) {
      const [details] = await db.query(
        'SELECT bookTitle, quantity, unitPrice FROM order_details WHERE orderId = ?',
        [order.orderId]
      );
      order.orderDetails = details;
      console.log('Fetched orderDate:', order.orderDate); // デバッグログ追加
    }
    res.json(orders.map(order => ({
      orderId: order.orderId,
      customerId: order.customerId,
      customerName: order.customerName,
      phone: order.phone,
      orderDate: typeof order.orderDate === 'string' ? order.orderDate : (order.orderDate ? order.orderDate.toISOString().slice(0, 10) : ''),
      totalAmount: order.totalAmount,
      orderDetails: order.orderDetails, // 配列で返す
      note: order.note || ''
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データ取得エラー' });
  }
});

// 新しい注文書を作成するAPI（POST）
router.post('/', async (req, res) => {
  const { customerId, orderDate, orderDetails, note } = req.body;
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
      'INSERT INTO orders (customerId, orderDate, note) VALUES (?, ?, ?)',
      [customerId, orderDate, note]
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

// GET /api/orders/:orderId
router.get('/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  try {
    // 注文書本体
    const [orders] = await db.query('SELECT * FROM orders WHERE orderId = ?', [orderId]);
    if (!orders.length) return res.status(404).json({ error: 'not found' });

    // 注文書明細
    const [details] = await db.query('SELECT * FROM order_details WHERE orderId = ?', [orderId]);

    // 顧客情報も取得
    const [customer] = await db.query('SELECT customerName, address FROM customers WHERE customerId = ?', [orders[0].customerId]);

    res.json({
      ...orders[0],
      orderDate: orders[0].orderDate ? orders[0].orderDate.toISOString().slice(0, 10) : '',
      orderDetails: details,
      customerName: customer[0]?.customerName || '',
      address: customer[0]?.address || ''
    });
  } catch (err) {
    res.status(500).json({ error: 'DB error', detail: err.message });
  }
});

// 注文書を更新するAPI（PUT）
router.put('/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  const { customerId, orderDate, orderDetails, note } = req.body;
  if (!customerId || !orderDate || !Array.isArray(orderDetails) || orderDetails.length === 0) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }
  const db = require('../db');
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // 注文書本体を更新
    await connection.query(
      'UPDATE orders SET customerId = ?, orderDate = ?, note = ? WHERE orderId = ?',
      [customerId, orderDate, note, orderId]
    );
    // 既存明細を削除
    await connection.query('DELETE FROM order_details WHERE orderId = ?', [orderId]);
    // 注文明細を再登録
    for (const detail of orderDetails) {
      await connection.query(
        'INSERT INTO order_details (orderId, bookTitle, quantity, unitPrice) VALUES (?, ?, ?, ?)',
        [orderId, detail.bookTitle, detail.quantity, detail.unitPrice]
      );
    }
    await connection.commit();
    res.status(200).json({ orderId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: '更新エラー' });
  } finally {
    connection.release();
  }
});

// このルーターをエクスポート
module.exports = router;
