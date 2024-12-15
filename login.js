// التحقق من تسجيل دخول المستخدم
function validateUserLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('error-message');
    
    // استرجاع بيانات المستخدمين المقبولين
    const userCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {};
    const userInfo = userCredentials[username];
    
    if (userInfo && userInfo.password === password && userInfo.isApproved) {
        // حفظ أو مسح بيانات تسجيل الدخول حسب اختيار المستخدم
        if (rememberMe) {
            saveCredentials(username, password);
        } else {
            clearSavedCredentials();
        }

        // التحقق من وجود جلسة نشطة
        const activeUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
        
        // إذا كان المستخدم مسجل دخول في مكان آخر
        if (activeUsers[username] && activeUsers[username].timestamp > Date.now() - 300000) { // 5 دقائق
            errorMessage.textContent = 'هذا الحساب مستخدم حالياً في جهاز آخر';
            return false;
        }
        
        // تسجيل الجلسة النشطة
        activeUsers[username] = {
            timestamp: Date.now(),
            sessionId: Math.random().toString(36).substring(7)
        };
        localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
        
        // تخزين بيانات المستخدم في الجلسة
        const sessionData = {
            username: username,
            name: userInfo.name,
            email: userInfo.email,
            sessionId: activeUsers[username].sessionId
        };
        sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        
        // إظهار رسالة نجاح
        errorMessage.style.color = 'green';
        errorMessage.textContent = 'تم تسجيل الدخول بنجاح! جاري التحويل...';
        
        // التوجيه إلى الصفحة الرئيسية بعد ثانية واحدة
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        errorMessage.textContent = 'بيانات تسجيل الدخول غير صحيحة أو لم يتم قبول طلبك بعد';
    }
    
    return false;
}

// التحقق من صلاحية الجلسة
function validateSession() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        const activeUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
        const userSession = activeUsers[currentUser.username];
        
        // التحقق من أن الجلسة لا تزال نشطة ومطابقة
        if (!userSession || 
            userSession.sessionId !== currentUser.sessionId || 
            userSession.timestamp < Date.now() - 300000) { // 5 دقائق
            logout();
            return false;
        }
        
        // تحديث توقيت آخر نشاط
        userSession.timestamp = Date.now();
        localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
        return true;
    }
    return false;
}

// تحديث الجلسة كل دقيقة
setInterval(validateSession, 60000);

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const isValid = validateSession();
    
    // إذا كان المستخدم في صفحة تسجيل الدخول وجلسته صالحة
    if (isValid && window.location.href.includes('login.html')) {
        window.location.href = 'index.html';
    }
    // إذا كان المستخدم في الصفحة الرئيسية وجلسته غير صالحة
    else if (!isValid && !window.location.href.includes('login.html') && !window.location.href.includes('request.html')) {
        window.location.href = 'login.html';
    }
}

// تسجيل الخروج
function logout() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser) {
        // إزالة الجلسة النشطة
        const activeUsers = JSON.parse(localStorage.getItem('activeUsers')) || {};
        delete activeUsers[currentUser.username];
        localStorage.setItem('activeUsers', JSON.stringify(activeUsers));
    }
    
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// إضافة مستمع لأحداث النشاط
document.addEventListener('mousemove', () => validateSession());
document.addEventListener('keypress', () => validateSession());

// استرجاع بيانات تسجيل الدخول المحفوظة
function getSavedCredentials() {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
        return JSON.parse(savedCredentials);
    }
    return null;
}

// حفظ بيانات تسجيل الدخول
function saveCredentials(username, password) {
    const credentials = {
        username: username,
        password: password
    };
    localStorage.setItem('savedCredentials', JSON.stringify(credentials));
}

// مسح بيانات تسجيل الدخول المحفوظة
function clearSavedCredentials() {
    localStorage.removeItem('savedCredentials');
}

// ملء نموذج تسجيل الدخول ببيانات محفوظة
function fillLoginForm() {
    const savedCredentials = getSavedCredentials();
    if (savedCredentials) {
        document.getElementById('username').value = savedCredentials.username;
        document.getElementById('password').value = savedCredentials.password;
        document.getElementById('rememberMe').checked = true;
    }
}

// عند تحميل الصفحة
window.addEventListener('load', () => {
    checkLoginStatus();
    // ملء النموذج ببيانات تسجيل الدخول المحفوظة إذا وجدت
    if (window.location.href.includes('login.html')) {
        fillLoginForm();
    }
});
