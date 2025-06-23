// order_form.js
// 注文書の保存・印刷ボタン機能

document.addEventListener('DOMContentLoaded', function() {
    // 保存ボタン
    const saveBtn = document.querySelector('.btn-area .btn[type="submit"], #saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const formData = getOrderFormData();
            localStorage.setItem('orderFormData', JSON.stringify(formData));
            const name = document.querySelector('.order-to-name input')?.value || '';
            alert(`注文書（${name || '無名'}）保存しました`);
            window.location.href = 'order_list.html';
        });
    }
    // 読み込み（自動）
    const saved = localStorage.getItem('orderFormData');
    if (saved) {
        setOrderFormData(JSON.parse(saved));
    }
    // 印刷ボタン
    const printBtn = document.querySelector('.btn-area .btn[type="button"], #printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
});

function getOrderFormData() {
    const data = {};
    document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
        data[input.name || input.className + input.type] = input.value;
    });
    return data;
}

function setOrderFormData(data) {
    document.querySelectorAll('.a4-sheet input, .a4-sheet textarea').forEach(input => {
        const key = input.name || input.className + input.type;
        if (data[key] !== undefined) input.value = data[key];
    });
}
