// تهيئة قاعدة البيانات IndexedDB
let db;
const dbName = "coursesDB";
const dbVersion = 1;

// فتح اتصال مع قاعدة البيانات
const request = indexedDB.open(dbName, dbVersion);

request.onerror = (event) => {
    console.error("خطأ في قاعدة البيانات:", event.target.error);
    showNotification("حدث خطأ في الاتصال بقاعدة البيانات", "error");
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    
    // إنشاء مخزن الدورات
    if (!db.objectStoreNames.contains("courses")) {
        const coursesStore = db.createObjectStore("courses", { keyPath: "id", autoIncrement: true });
        coursesStore.createIndex("title", "title", { unique: false });
        coursesStore.createIndex("startDate", "startDate", { unique: false });
    }
    
    // إنشاء مخزن التسجيلات
    if (!db.objectStoreNames.contains("registrations")) {
        const registrationsStore = db.createObjectStore("registrations", { keyPath: "id", autoIncrement: true });
        registrationsStore.createIndex("courseId", "courseId", { unique: false });
        registrationsStore.createIndex("status", "status", { unique: false });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("تم فتح قاعدة البيانات بنجاح");
    loadCourses();
    loadRegistrations();
};

// وظائف إدارة الدورات
async function addCourse(courseData) {
    try {
        const transaction = db.transaction(["courses"], "readwrite");
        const store = transaction.objectStore("courses");
        
        await new Promise((resolve, reject) => {
            const request = store.add(courseData);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        showNotification("تم إضافة الدورة بنجاح", "success");
        await loadCourses();
    } catch (error) {
        console.error("خطأ في إضافة الدورة:", error);
        showNotification("حدث خطأ أثناء إضافة الدورة", "error");
    }
}

async function loadCourses() {
    try {
        const transaction = db.transaction(["courses"], "readonly");
        const store = transaction.objectStore("courses");
        
        const courses = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        displayCourses(courses);
    } catch (error) {
        console.error("خطأ في تحميل الدورات:", error);
        showNotification("حدث خطأ أثناء تحميل الدورات", "error");
    }
}

async function deleteCourse(courseId) {
    if (!confirm("هل أنت متأكد من حذف هذه الدورة؟")) return;
    
    try {
        const transaction = db.transaction(["courses"], "readwrite");
        const store = transaction.objectStore("courses");
        
        await new Promise((resolve, reject) => {
            const request = store.delete(courseId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        showNotification("تم حذف الدورة بنجاح", "success");
        await loadCourses();
    } catch (error) {
        console.error("خطأ في حذف الدورة:", error);
        showNotification("حدث خطأ أثناء حذف الدورة", "error");
    }
}

// وظائف إدارة التسجيلات
async function loadRegistrations(filters = {}) {
    try {
        const transaction = db.transaction(["registrations"], "readonly");
        const store = transaction.objectStore("registrations");
        
        let registrations = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        // تطبيق الفلترة
        if (filters.status) {
            registrations = registrations.filter(reg => reg.status === filters.status);
        }
        
        displayRegistrations(registrations);
    } catch (error) {
        console.error("خطأ في تحميل التسجيلات:", error);
        showNotification("حدث خطأ أثناء تحميل طلبات التسجيل", "error");
    }
}

async function updateRegistrationStatus(registrationId, newStatus) {
    try {
        const transaction = db.transaction(["registrations"], "readwrite");
        const store = transaction.objectStore("registrations");
        
        const registration = await new Promise((resolve, reject) => {
            const request = store.get(registrationId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        registration.status = newStatus;
        
        await new Promise((resolve, reject) => {
            const request = store.put(registration);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        showNotification("تم تحديث حالة الطلب بنجاح", "success");
        await loadRegistrations();
    } catch (error) {
        console.error("خطأ في تحديث حالة الطلب:", error);
        showNotification("حدث خطأ أثناء تحديث حالة الطلب", "error");
    }
}

// وظائف عرض البيانات
function displayCourses(courses) {
    const coursesContainer = document.querySelector("#courses-list");
    if (!coursesContainer) return;
    
    coursesContainer.innerHTML = "";
    
    courses.forEach(course => {
        const courseElement = document.createElement("div");
        courseElement.className = "course-card";
        courseElement.innerHTML = `
            <div class="course-image">
                <img src="${course.image || 'placeholder.jpg'}" alt="${course.title}">
            </div>
            <div class="course-info">
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-details">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(course.startDate).toLocaleDateString("ar-SA")}</span>
                    <span><i class="fas fa-users"></i> ${course.capacity} طالب</span>
                    <span><i class="fas fa-money-bill"></i> ${course.price} ريال</span>
                </div>
            </div>
            <div class="course-actions">
                <button onclick="editCourse(${course.id})" class="edit-button">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button onclick="deleteCourse(${course.id})" class="delete-button">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        coursesContainer.appendChild(courseElement);
    });
}

function displayRegistrations(registrations) {
    const registrationsContainer = document.querySelector("#registrations-list");
    if (!registrationsContainer) return;
    
    registrationsContainer.innerHTML = "";
    
    registrations.forEach(registration => {
        const registrationElement = document.createElement("div");
        registrationElement.className = "request-card";
        registrationElement.innerHTML = `
            <div class="request-header">
                <h3 class="request-title">${registration.studentName}</h3>
                <span class="request-status status-${registration.status.toLowerCase()}">
                    ${getStatusText(registration.status)}
                </span>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <i class="fas fa-book"></i>
                    <span>${registration.courseName}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-envelope"></i>
                    <span>${registration.email}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-phone"></i>
                    <span>${registration.phone}</span>
                </div>
            </div>
            ${registration.status === "PENDING" ? `
                <div class="request-actions">
                    <button onclick="updateRegistrationStatus(${registration.id}, 'APPROVED')" class="approve-button">
                        <i class="fas fa-check"></i> قبول
                    </button>
                    <button onclick="updateRegistrationStatus(${registration.id}, 'REJECTED')" class="reject-button">
                        <i class="fas fa-times"></i> رفض
                    </button>
                </div>
            ` : ""}
        `;
        registrationsContainer.appendChild(registrationElement);
    });
}

// وظائف مساعدة
function getStatusText(status) {
    const statusMap = {
        "PENDING": "قيد المراجعة",
        "APPROVED": "مقبول",
        "REJECTED": "مرفوض"
    };
    return statusMap[status] || status;
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add("show");
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // تبديل التبويبات
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");
            
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));
            
            button.classList.add("active");
            document.querySelector(`#${tabId}`).classList.add("active");
        });
    });
    
    // معالجة نموذج إضافة دورة
    const courseForm = document.querySelector("#add-course-form");
    if (courseForm) {
        courseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const formData = new FormData(courseForm);
            const courseData = {
                title: formData.get("title"),
                description: formData.get("description"),
                price: parseFloat(formData.get("price")),
                duration: formData.get("duration"),
                startDate: formData.get("startDate"),
                capacity: parseInt(formData.get("capacity")),
                image: await getBase64(formData.get("image"))
            };
            
            try {
                await addCourse(courseData);
                courseForm.reset();
                closeAddCourseModal();
            } catch (error) {
                console.error("خطأ في إرسال النموذج:", error);
            }
        });
    }
    
    // معاينة الصورة
    const imageInput = document.querySelector("#course-image");
    const imagePreview = document.querySelector("#image-preview");
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = "block";
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error("خطأ في معاينة الصورة:", error);
                }
            }
        });
    }
    
    // فلترة طلبات التسجيل
    const statusFilter = document.querySelector("#status-filter");
    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            loadRegistrations({ status: statusFilter.value });
        });
    }
});

// وظائف النافذة المنبثقة
function openAddCourseModal() {
    const modal = document.querySelector("#add-course-modal");
    if (modal) {
        modal.style.display = "block";
    }
}

function closeAddCourseModal() {
    const modal = document.querySelector("#add-course-modal");
    const form = document.querySelector("#add-course-form");
    const imagePreview = document.querySelector("#image-preview");
    
    if (modal) modal.style.display = "none";
    if (form) form.reset();
    if (imagePreview) imagePreview.style.display = "none";
}

// وظيفة تحويل الصورة إلى Base64
function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
