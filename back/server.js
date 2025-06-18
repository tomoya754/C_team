// 必要なモジュールを読み込み
const express = require('express');
const app = express();
const PORT = 3000;

// CORS対応（フロントからのリクエスト許可）
const cors = require('cors');
app.use(cors());

// 仮の注文書データを外部ファイルから読み込み
const orders = require('./orders');
// 仮の納品書データを外部ファイルから読み込み
const deliveries = require('./deliveries');

// 注文書一覧API
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// 納品書一覧API
app.get('/api/deliveries', (req, res) => {
  res.json(deliveries);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
