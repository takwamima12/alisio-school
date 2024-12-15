// استرجاع الطلبات من localStorage
function getRequests() {
    return JSON.parse(localStorage.getItem('pendingRequests')) || [];
}

// تحديث الطلبات في localStorage
function updateRequests(requests) {
    localStorage.setItem('pendingRequests', JSON.stringify(requests));
}

// تحديث إحصائيات الطلبات
function updateStats() {
    const requests = getRequests();
    const pending = requests.filter(r => r.status === 'pending').length;
    const accepted = requests.filter(r => r.status === 'accepted').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    document.getElementById('newRequestsCount').textContent = pending;
    document.getElementById('acceptedRequestsCount').textContent = accepted;
    document.getElementById('rejectedRequestsCount').textContent = rejected;
}

// إنشاء بطاقة طلب
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    card.innerHTML = `
        <div class="request-header">
            <h3>${request.fullName}</h3>
            <span class="status-badge status-${request.status}">
                ${getStatusText(request.status)}
            </span>
        </div>
        <div class="request-info">
            <p><strong>البريد الإلكتروني:</strong> ${request.email}</p>
            <p><strong>رقم الهاتف:</strong> ${request.phone}</p>
            <p><strong>سبب الانضمام:</strong> ${request.reason}</p>
            <p><strong>تاريخ الطلب:</strong> ${request.date}</p>
        </div>
        ${request.status === 'pending' ? `
            <div class="request-actions">
                <button class="accept-btn" onclick="handleRequest('${request.id}', 'accepted')">قبول</button>
                <button class="reject-btn" onclick="handleRequest('${request.id}', 'rejected')">رفض</button>
            </div>
        ` : ''}
    `;
    return card;
}

// الحصول على النص العربي لحالة الطلب
function getStatusText(status) {
    switch (status) {
        case 'pending': return 'قيد المراجعة';
        case 'accepted': return 'مقبول';
        case 'rejected': return 'مرفوض';
        default: return '';
    }
}

// معالجة الطلب (قبول/رفض)
function handleRequest(requestId, newStatus) {
    const requests = getRequests();
    const request = requests.find(r => r.id.toString() === requestId);
    
    if (request) {
        request.status = newStatus;
        if (newStatus === 'accepted') {
            // إنشاء بيانات تسجيل دخول للمستخدم
            const username = request.email.split('@')[0];
            const password = Math.random().toString(36).slice(-8);
            
            // تخزين بيانات تسجيل الدخول
            const userCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};
            userCredentials[username] = {
                password: password,
                email: request.email,
                name: request.fullName,
                isApproved: true
            };
            localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
            
            alert(`تم قبول الطلب!\n\nبيانات تسجيل الدخول للمستخدم:\nاسم المستخدم: ${username}\nكلمة المرور: ${password}\n\nسيتمكن المستخدم من الدخول مباشرة باستخدام هذه البيانات`);
        }
        
        updateRequests(requests);
        updateStats();
        filterRequests(currentFilter);
    }
}

// تصفية الطلبات حسب الحالة
let currentFilter = 'pending';

function filterRequests(status) {
    currentFilter = status;
    const requests = getRequests();
    const filteredRequests = requests.filter(r => r.status === status);
    
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = '';
    
    filteredRequests.forEach(request => {
        requestsList.appendChild(createRequestCard(request));
    });
    
    // تحديث حالة أزرار التصفية
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === status);
    });
}

// إعداد أحداث أزرار التصفية
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => filterRequests(btn.dataset.status));
});

// تحميل البيانات عند فتح الصفحة
window.addEventListener('load', () => {
    updateStats();
    filterRequests('pending');
});
