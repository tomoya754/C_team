// 注文データと納品データを読み込む
const orders = require('../models/orders');
const deliveries = require('../models/deliveries');

// 顧客ごとの統計情報を集計する関数
function aggregateStatistics() {
  // 顧客IDごとに初期化（初めて出てきた顧客の場合）
  const statsMap = {};

  // 注文データを1件ずつ処理
  orders.forEach(order => {
    // 顧客IDごとに初期化（初めて出てきた顧客の場合）
    if (!statsMap[order.customerId]) {
      statsMap[order.customerId] = {
        customerId: order.customerId, // 顧客ID
        customerName: order.customerName, // 顧客名
        address: '', // 住所（今回はデータがないので空欄）
        totalSales: 0, // 累計売上額
        leadTimes: [], // リードタイム（日数差）の配列
        orderCount: 0, // 購入回数
        lastOrderDate: '', // 最終購入日
        note: '' // 備考
      };
    }
    // 注文詳細から数量を抽出し、金額を計算（例：1個=100円）
    const match = order.orderDetail.match(/([0-9]+)(個|房|袋)/);
    const amount = match ? parseInt(match[1], 10) * 100 : 0;
    const stat = statsMap[order.customerId];
    stat.totalSales += amount; // 累計売上額に加算
    stat.orderCount += 1; // 購入回数をカウント
    // 最終購入日を更新（新しい日付があれば上書き）
    if (!stat.lastOrderDate || stat.lastOrderDate < order.orderDate) {
      stat.lastOrderDate = order.orderDate;
    }
    // 備考があればセット
    if (order.note) {
      stat.note = order.note;
    }
  });

  // 納品データからリードタイム（日数差）を計算
  deliveries.forEach(delivery => {
    // 対応する注文データを検索
    const order = orders.find(o => o.customerId === delivery.customerId && o.orderDetail === delivery.orderDetail);
    if (order && delivery.deliveryDate && order.orderDate) {
      // 納品日と注文日からリードタイム（日数）を計算
      const leadTime = (new Date(delivery.deliveryDate) - new Date(order.orderDate)) / (1000 * 60 * 60 * 24);
      if (!isNaN(leadTime)) {
        statsMap[delivery.customerId]?.leadTimes.push(leadTime); // 配列に追加
      }
    }
  });

  // 顧客ごとの統計情報を配列に変換して返す
  return Object.values(statsMap).map(stat => ({
    customerId: stat.customerId, // 顧客ID
    customerName: stat.customerName, // 顧客名
    address: stat.address, // 住所
    totalSales: stat.totalSales, // 累計売上額
    averageLeadTime: stat.leadTimes.length > 0 ? (stat.leadTimes.reduce((a, b) => a + b, 0) / stat.leadTimes.length).toFixed(1) : '-', // 平均リードタイム
    orderCount: stat.orderCount, // 購入回数
    lastOrderDate: stat.lastOrderDate, // 最終購入日
    note: stat.note // 備考
  }));
}

// この関数を他のファイルから使えるようにエクスポート
module.exports = { aggregateStatistics };
