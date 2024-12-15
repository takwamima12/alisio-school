// بيانات المدير
const adminCredentials = {
    username: 'SOHAIB',
    password: 'RAHA234@'
};

// التحقق من تسجيل دخول المدير
function validateAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('adminError');
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // تخزين حالة تسجيل دخول المدير
        localStorage.setItem('adminLoggedIn', 'true');
        // التوجيه إلى لوحة التحكم
        window.location.href = 'admin-dashboard.html';
    } else {
        errorElement.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        errorElement.style.display = 'block';
    }
}

// التحقق من حالة تسجيل دخول المدير
function checkAdminAuth() {
    if (!localStorage.getItem('adminLoggedIn') && !window.location.href.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
    }
}

// تسجيل خروج المدير
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// التحقق عند تحميل الصفحة
window.addEventListener('load', checkAdminAuth);
