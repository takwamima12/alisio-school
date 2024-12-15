// قائمة الطلبات المعلقة (يمكنك تخزينها في قاعدة بيانات حقيقية)
const pendingRequests = [];

// دالة لإرسال الطلب
function submitRequest(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const reason = document.getElementById('reason').value;
    const message = document.getElementById('message');
    
    // إنشاء كائن الطلب
    const request = {
        id: Date.now(),
        fullName,
        email,
        phone,
        reason,
        status: 'pending',
        date: new Date().toLocaleDateString('ar')
    };
    
    // إضافة الطلب إلى القائمة
    pendingRequests.push(request);
    
    // حفظ الطلب في localStorage
    localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
    
    // عرض رسالة نجاح
    message.className = 'message success';
    message.textContent = 'تم إرسال طلبك بنجاح. سيتم مراجعته والرد عليك قريباً.';
    
    // مسح النموذج
    document.getElementById('requestForm').reset();
    
    // تحويل المستخدم إلى صفحة الانتظار بعد 3 ثواني
    setTimeout(() => {
        window.location.href = 'pending.html';
    }, 3000);
    
    return false;
}
