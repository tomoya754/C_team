const mysql = require('mysql2/promise');

// MySQL接続情報（必要に応じて修正してください）
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // パスワードを設定している場合はここに記入
  database: 'customer_db', // 事前に作成しておく
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
