// delivery_form.js
// 納品書の保存・印刷ボタン機能

document.addEventListener('DOMContentLoaded', function() {
    // 保存ボタン
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const formData = getDeliveryFormData();
            localStorage.setItem('deliveryFormData', JSON.stringify(formData));
            const name = document.querySelector('.order-to-name input')?.value || '';
            alert(`納品書（${name || '無名'}）保存しました`);
            window.location.href = 'delivery_list.html';
        });
    }
    // 読み込み（自動）
    const saved = localStorage.getItem('deliveryFormData');
    if (saved) {
        setDeliveryFormData(JSON.parse(saved));
    }
    // 印刷ボタン
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }
});

function getDeliveryFormData() {
    const data = {};
    document.querySelectorAll('.a4-sheet input').forEach(input => {
        data[input.name || input.className + input.type] = input.value;
    });
    return data;
}

function setDeliveryFormData(data) {
    document.querySelectorAll('.a4-sheet input').forEach(input => {
        const key = input.name || input.className + input.type;
        if (data[key] !== undefined) input.value = data[key];
    });
}
