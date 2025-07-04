const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const db = require('../db'); // 追加

const router = express.Router();

// アップロード先を一時ディレクトリに
const upload = multer({ dest: 'tmp/' });

// CSVアップロードAPI
router.post('/upload-customers', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ファイルがアップロードされていません' });
  }
  const filePath = req.file.path;
  const customers = [];
  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on('data', (row) => {
      customers.push(row);
    })
    .on('end', async () => {
      try {
        // MySQLに保存
        const conn = await db.getConnection();
        for (const customer of customers) {
          if (!customer.customerId || !customer.shopName || !customer.customerName) {
            continue; // またはエラー処理
          }
          await conn.query(
            'INSERT INTO customers (customerId, shopName, customerName, staffName, address, phone, deliveryCondition, note, registeredAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              customer.customerId || null,
              customer.shopName || null,
              customer.customerName || null,
              customer.staffName || null,
              customer.address || null,
              customer.phone || null,
              customer.deliveryCondition || null,
              customer.note || null,
              customer.registeredAt || null
            ]
          );
        }
        conn.release();
        fs.unlinkSync(filePath); // 一時ファイル削除
        res.json({ message: '顧客情報をMySQLに保存しました', count: customers.length });
      } catch (err) {
        fs.unlinkSync(filePath);
        res.status(500).json({ error: 'MySQLへの保存に失敗しました', detail: err.message });
      }
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'CSVのパースに失敗しました' });
    });
});

module.exports = router;
