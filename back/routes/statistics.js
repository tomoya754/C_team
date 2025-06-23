// Expressフレームワークを読み込む
const express = require('express');
// ルーターオブジェクトを作成
const router = express.Router();
// 統計情報集計用の関数をコントローラーから読み込む
const { aggregateStatistics } = require('../controllers/statisticsController');

// 統計情報一覧API
router.get('/', (req, res) => {
  // 集計した統計情報データを取得
  const statistics = aggregateStatistics();
  // 統計情報をJSON形式で返す
  res.json(statistics);
});



// このルーターを他のファイルで使えるようにエクスポート
module.exports = router;
