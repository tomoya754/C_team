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
  else if (sortKey === 'averageLeadTime') orderBy = `averageLeadTime ${sortOrder.toUpperCase()}`;

  // SQL集計（加重平均リードタイム: (納品日-注文日)×納品冊数の合計÷納品冊数の合計、異なる本も考慮）
  const [rows] = await db.query(`
    SELECT
      c.customerId,
      c.customerName,
      c.address,
      IFNULL(SUM(d.totalAmount), 0) AS totalSales,
      COUNT(DISTINCT o.orderId) AS orderCount,
      ROUND(
        SUM(
          CASE
            WHEN od.undeliveredQuantity = 0
             AND dd.orderDetailId IS NOT NULL
             AND o.orderDate IS NOT NULL
             AND deliv.deliveryDate IS NOT NULL
             AND dd.quantity IS NOT NULL
            THEN DATEDIFF(deliv.deliveryDate, o.orderDate) * dd.quantity
            ELSE 0
          END
        ) / NULLIF(SUM(CASE WHEN od.undeliveredQuantity = 0 AND dd.quantity IS NOT NULL THEN dd.quantity ELSE 0 END), 0), 1
      ) AS averageLeadTime
    FROM customers c
    LEFT JOIN orders o ON c.customerId = o.customerId
    LEFT JOIN order_details od ON o.orderId = od.orderId
    LEFT JOIN delivery_details dd ON od.orderDetailId = dd.orderDetailId
    LEFT JOIN deliveries deliv ON dd.deliveryId = deliv.deliveryId
    LEFT JOIN deliveries d ON c.customerId = d.customerId
    ${where}
    GROUP BY c.customerId, c.customerName, c.address
    ORDER BY ${orderBy}
  `, params);
  res.json(rows);
});



// このルーターを他のファイルで使えるようにエクスポート
module.exports = router;
