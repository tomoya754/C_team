// サイドバー開閉
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarBg = document.getElementById('sidebarBg');
const sidebarClose = document.getElementById('sidebarClose');
function openSidebar() {
    sidebar.classList.add('open');
    sidebarBg.classList.add('show');
    menuBtn.style.display = 'none';
    sidebarClose.style.display = 'block';
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBg.classList.remove('show');
    menuBtn.style.display = 'block';
    sidebarClose.style.display = 'none';
}
menuBtn.onclick = openSidebar;
sidebarClose.onclick = closeSidebar;
sidebarBg.onclick = closeSidebar;

// Excel→CSV変換＆送信
document.getElementById('excelForm').onsubmit = function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('ファイルを選択してください');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        let json = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { header: 1 });

        // 日本語→英語カラム名変換
        const headerMap = {
            '顧客ID': 'customerId',
            '店舗名': 'shopName',
            '顧客名': 'customerName',
            '担当者名': 'staffName',
            '住所': 'address',
            '電話番号': 'phone',
            '配達先条件等': 'deliveryCondition',
            '備考': 'note',
            '顧客登録日': 'registeredAt'
        };
        json[0] = json[0].map(h => headerMap[h] || h);

        // CSVに変換
        const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(json));

        // CSVをFormDataで送信
        const blob = new Blob([csv], { type: 'text/csv' });
        const formData = new FormData();
        formData.append('file', blob, 'customers.csv');

        fetch('http://localhost:3000/api/import/upload-customers', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            alert('登録完了: ' + (data.message || ''));
        })
        .catch(err => {
            alert('登録失敗');
            console.error(err);
        });
    };
    reader.readAsArrayBuffer(file);
};