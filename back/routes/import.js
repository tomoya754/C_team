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
        // 全カラム空の行を除外
        const filteredCustomers = customers.filter(c => Object.values(c).some(v => String(v).trim() !== ''));
        // すべての値を正規化
        const normalizedCustomers = filteredCustomers.map(c => {
          const cid = c.customerId ? String(c.customerId).replace(/[^0-9]/g, '') : '';
          return {
            customerId: cid,
            shopName: c.shopName ? String(c.shopName).trim() : '',
            customerName: c.customerName ? String(c.customerName).trim() : '',
            staffName: c.staffName ? String(c.staffName).trim() : '',
            address: c.address ? String(c.address).trim() : '',
            phone: c.phone ? String(c.phone).trim() : '',
            deliveryCondition: c.deliveryCondition ? String(c.deliveryCondition).trim() : '',
            note: c.note ? String(c.note).trim() : '',
            registeredAt: c.registeredAt ? String(c.registeredAt).trim() : ''
          };
        });
        // 既存の顧客ID一覧を取得
        const conn = await db.getConnection();
<<<<<<< HEAD
        for (const customer of customers) {
          if (!customer.customerId || !customer.shopName || !customer.customerName) {
            continue; // またはエラー処理
          }
=======
        const [dbCustomers] = await conn.query('SELECT customerId FROM customers');
        const dbCustomerIds = dbCustomers.map(row => String(row.customerId));
        const csvCustomerIds = normalizedCustomers.map(c => String(c.customerId));
        // CSVに存在しない顧客IDはisDeleted=1に
        for (const dbId of dbCustomerIds) {
          if (!csvCustomerIds.includes(dbId)) {
            await conn.query('UPDATE customers SET isDeleted=1 WHERE customerId=?', [dbId]);
          }
        }
        // 必須項目チェック
        const requiredFields = ['customerId', 'shopName', 'customerName', 'address', 'phone'];
        const missingRows = normalizedCustomers.filter(c =>
          requiredFields.some(f => !c[f] || String(c[f]).trim() === '')
        );
        if (missingRows.length > 0) {
          console.log('【missingRows】', missingRows); // デバッグ用
          conn.release();
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: '必要な項目が抜けています（顧客ID・店舗名・顧客名・住所・電話番号）' });
        }
        // CSVの各顧客をINSERTまたはUPDATE
        for (const customer of normalizedCustomers) {
          if (!customer.customerId) continue;
          const id = customer.customerId;
          // すでに同じIDをこのアップロード内で処理済みならスキップ
          if (normalizedCustomers.filter(c => String(c.customerId) === id).length > 1 && normalizedCustomers.findIndex(c => String(c.customerId) === id) !== normalizedCustomers.indexOf(customer)) continue;
>>>>>>> 2ffc499203424921f3d2e40cad7aefd999207ef7
          await conn.query(
            `INSERT INTO customers (customerId, shopName, customerName, staffName, address, phone, deliveryCondition, note, registeredAt, isDeleted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
             ON DUPLICATE KEY UPDATE
               shopName=VALUES(shopName), customerName=VALUES(customerName), staffName=VALUES(staffName), address=VALUES(address), phone=VALUES(phone), deliveryCondition=VALUES(deliveryCondition), note=VALUES(note), registeredAt=VALUES(registeredAt), isDeleted=0`,
            [
              Number(id),
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
        res.json({ message: '顧客情報をMySQLに保存しました', count: filteredCustomers.length });
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
