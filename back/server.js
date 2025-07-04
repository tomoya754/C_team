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

app.use('/api/statistics', statisticsRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/import', importRouter);

// サーバー起動
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:3000`);
});


/*CSV形式のエクセルデータをデータベースに反映するシステムを作るには、以下のような流れが一般的です。

フロントでCSVファイルをアップロード
バックエンドでCSVを受け取り、パース
パースしたデータをデータベースに保存

まずはバックエンド側で「CSVファイルを受け取り、データベース（今回はファイルベースやメモリ配列でも可）に反映するAPI」を実装します。
Node.js / Expressでよく使うCSVパーサーは csv - parse や papaparse、ファイルアップロードには multer などがあります。

まず必要なパッケージをインストールします。

この後、routes / import.js などにアップロードAPIを実装し、server.js でルーティングします。
実装を進めてもよろしいですか？
（データベースは何を想定しますか？なければ一旦メモリ配列やJSONファイル保存で進めます）*/