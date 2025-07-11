// Expressフレームワークを読み込む
const express = require('express');
// ルーターオブジェクトを作成
const router = express.Router();
// 統計情報集計用の関数をコントローラーから読み込む
const { aggregateStatistics } = require('../controllers/statisticsController');

// 統計情報一覧API
router.get('/', (req, res) => {
  const storeId = Number(req.query.storeId || 0);
  let statistics = aggregateStatistics();
  if (storeId && storeId !== 0) {
    // 店舗ID→店舗名変換マップ
    const storeIdToName = { 1: '緑橋本店', 2: '深江橋店', 3: '今里店' };
    const shopName = storeIdToName[storeId];
    if (shopName) {
      // 顧客名や顧客IDから店舗名を特定できる場合はここでフィルタ
      statistics = statistics.filter(stat => stat.customerName === shopName);
    }
  }
  res.json(statistics);
});



// このルーターを他のファイルで使えるようにエクスポート
module.exports = router;
