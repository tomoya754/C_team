// Expressフレームワークを読み込む
const express = require('express');
const router = express.Router();

// 納品データを読み込む
const deliveries = require('../models/deliveries');

// 納品書一覧API（GET）
router.get('/', async (req, res) => {
  try {
    const db = require('../db');

    // 納品書情報を取得
    const deliveries = await db.query(
      `SELECT d.deliveryId, c.customerName, c.phone, d.deliveryDate, d.totalAmount, d.note,
              GROUP_CONCAT(dd.orderDetailId SEPARATOR ', ') AS deliveryContents
       FROM deliveries d
       JOIN customers c ON d.customerId = c.customerId
       LEFT JOIN delivery_details dd ON d.deliveryId = dd.deliveryId
       GROUP BY d.deliveryId`
    );

    res.json(deliveries[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データベースエラーが発生しました' });
  }
});

// 新しい納品書を作成するAPI（POST）
router.post('/', async (req, res) => {
  const newDelivery = req.body;

  // 必須項目のバリデーション
  if (!newDelivery.customerId || !newDelivery.deliveryDate || !newDelivery.items || newDelivery.items.length === 0) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }

  try {
    const db = require('../db');

    // 納品書をデータベースに保存
    console.log('納品書データ:', newDelivery);
    const deliveryResult = await db.query(
      `INSERT INTO deliveries (customerId, deliveryDate, totalAmount) VALUES (?, ?, ?)`,
      [newDelivery.customerId, newDelivery.deliveryDate, newDelivery.totalAmount || 0]
    );
    console.log('納品書挿入結果:', deliveryResult);

    const deliveryId = deliveryResult[0].insertId;

    if (!deliveryId) {
      throw new Error('Failed to insert delivery record');
    }

    // 納品書明細をデータベースに保存
    const deliveryDetails = newDelivery.items.map(item => [
      deliveryId,
      item.quantity,
      item.unitPrice,
      item.orderDetailId,
      item.orderId
    ]);

    await db.query(
      `INSERT INTO delivery_details (deliveryId, quantity, unitPrice, orderDetailId, orderId) VALUES ?`,
      [deliveryDetails]
    );

    res.status(201).json({ message: '納品書を保存しました', deliveryId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データベースエラーが発生しました' });
  }
});

// 納品状態を更新するAPI（PUT）
router.put('/:deliveryId/status', async (req, res) => {
  const { deliveryId } = req.params;
  const { deliveryStatus } = req.body;

  if (!deliveryStatus) {
    return res.status(400).json({ error: '納品状態が指定されていません' });
  }

  try {
    const db = require('../db');
    await db.query(
      `UPDATE deliveries SET deliveryStatus = ? WHERE deliveryId = ?`,
      [deliveryStatus, deliveryId]
    );

    res.status(200).json({ message: '納品状態を更新しました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データベースエラーが発生しました' });
  }
});

// 納品書詳細API（GET）
router.get('/:deliveryId', async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const db = require('../db');
    const delivery = await db.query(
      `SELECT d.deliveryId, c.customerName, c.phone, c.address, d.deliveryDate, d.totalAmount, d.note,
              GROUP_CONCAT(dd.orderDetailId SEPARATOR ', ') AS deliveryContents
       FROM deliveries d
       JOIN customers c ON d.customerId = c.customerId
       LEFT JOIN delivery_details dd ON d.deliveryId = dd.deliveryId
       WHERE d.deliveryId = ?
       GROUP BY d.deliveryId`,
      [deliveryId]
    );

    if (delivery[0].length === 0) {
      return res.status(404).json({ error: '納品書が見つかりません' });
    }

    res.json(delivery[0][0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'データベースエラーが発生しました' });
  }
});

// このルーターをエクスポート
module.exports = router;
