// 必要なモジュールを読み込み
const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');

// CORS対応（フロントからのリクエスト許可）
const cors = require('cors');
app.use(cors());

// JSONボディパース用ミドルウェアを追加
app.use(express.json());

// 静的ファイル（HTML, CSS, JSなど）を公開
app.use(express.static(path.join(__dirname, '../front')));

// ルートパスで home.html を表示<a href="/html/order_list.html">注文書一覧</a><a href="/html/order_list.html">注文書一覧</a>
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/html/home.html'));
});

// 仮の注文書データを外部ファイルから読み込み
const orders = require('./models/orders');
// 仮の納品書データを外部ファイルから読み込み
const deliveries = require('./models/deliveries');
const statisticsRouter = require('./routes/statistics');

// 注文書一覧API
app.get('/api/orders', (req, res) => {
  try {
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: '注文書一覧の取得に失敗しました' });
  }
});

// 納品書一覧API
app.get('/api/deliveries', (req, res) => {
  try {
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: '納品書一覧の取得に失敗しました' });
  }
});

// 新しい注文書を作成するAPI
app.post('/api/orders', (req, res) => {
  try {
    // リクエストボディから注文データを取得
    const newOrder = req.body;
    // 必須項目のバリデーション（例：customerId, customerName, orderDetail, orderDate）
    if (!newOrder.customerId || !newOrder.customerName || !newOrder.orderDetail || !newOrder.orderDate) {
      return res.status(400).json({ error: '必須項目が不足しています' });
    }
    // 注文IDを自動採番（orders配列の最大ID+1）
    newOrder.orderId = orders.length > 0 ? Math.max(...orders.map(o => o.orderId)) + 1 : 1;
    // 配列に追加
    orders.push(newOrder);
    // 完了レスポンス
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: '注文書の作成に失敗しました' });
  }
});

app.use('/api/statistics', statisticsRouter);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
