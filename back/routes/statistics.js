// Expressフレームワークを読み込む
const express = require('express');
// ルーターオブジェクトを作成
const router = express.Router();
// 統計情報集計用の関数をコントローラーから読み込む
const { aggregateStatistics } = require('../controllers/statisticsController');

// 統計情報一覧API
const db = require('../db');
router.get('/', async (req, res) => {
  const storeId = Number(req.query.storeId || 0);
  const sortKey = req.query.sortKey || 'totalSales';
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
  let where = '';
  let params = [];
  if (storeId && storeId !== 0) {
    const storeIdToName = { 1: '緑橋本店', 2: '深江橋店', 3: '今里店' };
    const shopName = storeIdToName[storeId];
    if (shopName) {
      where = 'WHERE c.shopName = ?';
      params.push(shopName);
    }
  }
  // 並び替えキー
  let orderBy = 'totalSales DESC';
  if (sortKey === 'totalSales') orderBy = `totalSales ${sortOrder.toUpperCase()}`;
  else if (sortKey === 'orderCount') orderBy = `orderCount ${sortOrder.toUpperCase()}`;
  // SQL集計
  const [rows] = await db.query(`
    SELECT
      c.customerId,
      c.customerName,
      c.address,
      IFNULL(SUM(d.totalAmount), 0) AS totalSales,
      COUNT(DISTINCT o.orderId) AS orderCount
    FROM customers c
    LEFT JOIN deliveries d ON c.customerId = d.customerId
    LEFT JOIN orders o ON c.customerId = o.customerId
    ${where}
    GROUP BY c.customerId, c.customerName, c.address
    ORDER BY ${orderBy}
  `, params);
  res.json(rows);
});



// このルーターを他のファイルで使えるようにエクスポート
module.exports = router;
