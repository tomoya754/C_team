// 注文データ
const orders = [
  {
    orderId: 1,
    customerId: 'C001',
    customerName: '山田太郎',
    orderDetail: 'りんご 5個',
    phone: '090-1111-2222',
    orderDate: '2025-06-18',
    note: '特記事項なし'
  },
  {
    orderId: 2,
    customerId: 'C002',
    customerName: '佐藤花子',
    orderDetail: 'バナナ 3房',
    phone: '080-3333-4444',
    orderDate: '2025-06-17',
    note: '午前中配達希望'
  },
  {
    orderId: 3,
    customerId: 'C003',
    customerName: '鈴木一郎',
    orderDetail: 'みかん 8袋',
    phone: '070-5555-6666',
    orderDate: '2025-06-16',
    note: ''
  }
];

module.exports = orders;
