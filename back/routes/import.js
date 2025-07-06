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
        const conn = await db.getConnection();
        // 既存の顧客ID一覧を取得
        const [dbCustomers] = await conn.query('SELECT customerId FROM customers');
        const dbCustomerIds = dbCustomers.map(row => String(row.customerId));
        const csvCustomerIds = customers.map(c => String(c.customerId));
        // CSVに存在しない顧客IDはisDeleted=1に
        for (const dbId of dbCustomerIds) {
          if (!csvCustomerIds.includes(dbId)) {
            await conn.query('UPDATE customers SET isDeleted=1 WHERE customerId=?', [dbId]);
          }
        }
        // CSVの各顧客をINSERTまたはUPDATE
        for (const customer of customers) {
          await conn.query(
            `INSERT INTO customers (customerId, shopName, customerName, staffName, address, phone, deliveryCondition, note, registeredAt, isDeleted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
             ON DUPLICATE KEY UPDATE
               shopName=VALUES(shopName), customerName=VALUES(customerName), staffName=VALUES(staffName), address=VALUES(address), phone=VALUES(phone), deliveryCondition=VALUES(deliveryCondition), note=VALUES(note), registeredAt=VALUES(registeredAt), isDeleted=0`,
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
