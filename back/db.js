const mysql = require('mysql2/promise');

// MySQL接続情報
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // パスワードを設定している場合はここに記入
  database: 'mbs', // mbsデータベースに変更
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4' // 文字コードを明示
});

module.exports = pool;
