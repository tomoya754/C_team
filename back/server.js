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

// ルーターの読み込み
const statisticsRouter = require('./routes/statistics');
const deliveriesRouter = require('./routes/deliveries');
const ordersRouter = require('./routes/orders');
const importRouter = require('./routes/import');
const customersRouter = require('./routes/customers');

app.use('/api/statistics', statisticsRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/import', importRouter);
app.use('/api/customers', customersRouter);

// サーバー起動
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:3000`);
});


/*注文書保存API、納品書保存API、注文書編集API,納品書編集API、注文書削除API、納品書削除API*/