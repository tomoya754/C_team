// 顧客データ差分更新用サンプル（Node.js/Express + MySQL）
// 必要に応じてルーティングやDB接続部分を調整してください

const express = require('express');
const router = express.Router();
const db = require('../db'); // 既存のDB接続モジュールを想定

// エクセルから受け取った顧客IDリストを元に差分で削除フラグを管理
router.post('/customers/sync', async (req, res) => {
    try {
        // エクセルから送信された顧客IDリスト（例: [1,2,3,4]）
        const excelIds = req.body.customerIds;
        if (!Array.isArray(excelIds)) {
            return res.status(400).json({ error: 'customerIds must be an array' });
        }

        // DBから全顧客IDリストを取得
        const [rows] = await db.query('SELECT customerId FROM customers');
        const dbIds = rows.map(row => row.customerId);

        // 差分計算
        const idsToDelete = dbIds.filter(id => !excelIds.includes(id));
        const idsToRestore = excelIds.filter(id => dbIds.includes(id));
        const idsToInsert = excelIds.filter(id => !dbIds.includes(id));

        // 削除フラグON
        if (idsToDelete.length > 0) {
            await db.query('UPDATE customers SET isDeleted=1 WHERE customerId IN (?)', [idsToDelete]);
        }
        // 削除フラグOFF
        if (idsToRestore.length > 0) {
            await db.query('UPDATE customers SET isDeleted=0 WHERE customerId IN (?)', [idsToRestore]);
        }
        // 新規追加（必要に応じて他カラムも追加）
        // ここではサンプルとしてIDのみ
        for (const id of idsToInsert) {
            await db.query('INSERT INTO customers (customerId, isDeleted) VALUES (?, 0)', [id]);
        }

        res.json({ success: true, deleted: idsToDelete, restored: idsToRestore, inserted: idsToInsert });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
