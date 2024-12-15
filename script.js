// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Add animation to course cards when they come into view
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.course-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(card);
});

// Handle course subscription
document.querySelectorAll('.course-card button').forEach(button => {
    button.addEventListener('click', function() {
        const courseName = this.parentElement.querySelector('h3').textContent;
        alert(`تم تسجيلك في ${courseName} بنجاح!`);
    });
});

// التحكم في تشغيل الفيديوهات
const videoButtons = document.querySelectorAll('.video-btn');
const videoPlayer = document.querySelector('.video-container video');

videoButtons.forEach(button => {
    button.addEventListener('click', function() {
        // إزالة الفئة النشطة من جميع الأزرار
        videoButtons.forEach(btn => btn.classList.remove('active'));
        
        // إضافة الفئة النشطة للزر المحدد
        this.classList.add('active');
        
        // تحديث مصدر الفيديو
        const videoSource = this.getAttribute('data-video');
        videoPlayer.src = videoSource;
        
        // تشغيل الفيديو
        videoPlayer.play();
    });
});

// عرض الفيديوهات في الصفحة الرئيسية
function displayVideos(filter = '') {
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const videoGrid = document.getElementById('videoGrid');
    
    if (!videoGrid) return;

    videoGrid.innerHTML = '';
    
    const filteredVideos = filter 
        ? videos.filter(video => video.category === filter)
        : videos;

    filteredVideos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // استخراج معرف الفيديو من رابط YouTube
        const videoId = extractVideoId(video.url);
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <iframe src="https://www.youtube.com/embed/${videoId}" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <p>${video.description.substring(0, 100)}...</p>
                <span class="video-category">${video.category}</span>
            </div>
        `;
        
        videoGrid.appendChild(videoCard);
    });
}

// استخراج معرف الفيديو من رابط YouTube
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// تصفية الفيديوهات حسب الفئة
function filterVideos() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        displayVideos(categoryFilter.value);
    }
}

// عرض الفيديوهات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    displayVideos();
});

// تهيئة قاعدة البيانات IndexedDB
let db = null;
const dbName = "alisioSchoolDB";
const dbVersion = 1;

// تهيئة قاعدة البيانات
const initDB = async () => {
    try {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);
            
            request.onerror = (event) => {
                console.error("خطأ في فتح قاعدة البيانات:", event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log("تم فتح قاعدة البيانات بنجاح");
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('courses')) {
                    const courseStore = db.createObjectStore('courses', { 
                        keyPath: 'courseId',
                        autoIncrement: true 
                    });
                    courseStore.createIndex('title', 'title', { unique: false });
                    courseStore.createIndex('instructor', 'instructor', { unique: false });
                    courseStore.createIndex('price', 'price', { unique: false });
                }
            };
        });
    } catch (error) {
        console.error("خطأ في تهيئة قاعدة البيانات:", error);
        throw error;
    }
};

// تحميل الدورات
async function loadCourses() {
    try {
        if (!db) {
            await initDB();
        }

        const coursesSection = document.getElementById('courses');
        if (!coursesSection) {
            console.error("لم يتم العثور على قسم الدورات");
            return;
        }

        const coursesContainer = coursesSection.querySelector('.row');
        if (!coursesContainer) {
            console.error("لم يتم العثور على حاوية الدورات");
            return;
        }

        coursesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">جاري التحميل...</span></div></div>';

        const transaction = db.transaction(['courses'], 'readonly');
        const courseStore = transaction.objectStore('courses');
        
        const courses = await new Promise((resolve, reject) => {
            const request = courseStore.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        coursesContainer.innerHTML = '';

        if (courses.length === 0) {
            coursesContainer.innerHTML = '<div class="col-12 text-center"><p class="no-courses">لا توجد دورات متاحة حالياً</p></div>';
            return;
        }

        courses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.className = 'col-md-4 mb-4';
            courseElement.innerHTML = `
                <div class="card h-100">
                    <div class="course-image">
                        ${course.image ? `<img src="${course.image}" class="card-img-top" alt="${course.title}">` : ''}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${course.title}</h5>
                        <p class="card-text">${course.description}</p>
                        <div class="course-meta">
                            <span class="instructor"><i class="fas fa-user"></i> ${course.instructor}</span>
                            <span class="price"><i class="fas fa-tag"></i> ${course.price} ريال</span>
                        </div>
                        ${course.videos && course.videos.length > 0 ? `
                            <div class="course-videos mt-3">
                                <h6>محتويات الدورة (${course.videos.length} فيديو)</h6>
                                <div class="list-group">
                                    ${course.videos.map((video, index) => `
                                        <button type="button" class="list-group-item list-group-item-action" 
                                                data-bs-toggle="modal" data-bs-target="#videoModal${course.id}-${index}">
                                            <i class="fas fa-play-circle"></i> ${video.name || `فيديو ${index + 1}`}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            ${course.videos.map((video, index) => `
                                <div class="modal fade" id="videoModal${course.id}-${index}" tabindex="-1">
                                    <div class="modal-dialog modal-lg">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title">${video.name || `فيديو ${index + 1}`}</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                <video controls class="w-100">
                                                    <source src="${URL.createObjectURL(new Blob([video.data], {type: video.type}))}" type="${video.type}">
                                                </video>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        ` : ''}
                    </div>
                </div>
            `;
            coursesContainer.appendChild(courseElement);
        });

    } catch (error) {
        console.error("خطأ في تحميل الدورات:", error);
        const coursesContainer = document.querySelector('#courses .row');
        if (coursesContainer) {
            coursesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        حدث خطأ في تحميل الدورات: ${error.message}
                        <button class="btn btn-outline-danger ms-2" onclick="loadCourses()">إعادة المحاولة</button>
                    </div>
                </div>
            `;
        }
    }
}

// تحميل الإعدادات من localStorage
const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('siteSettings')) || {
        siteName: 'ALISIO SCHOOL',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d'
    };
    
    // تطبيق الإعدادات
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    document.title = settings.siteName;
    document.querySelector('.navbar-brand').textContent = settings.siteName;
};

// تحميل بيانات القسم الرئيسي
const loadHeroSection = () => {
    const heroSection = JSON.parse(localStorage.getItem('heroSection')) || {
        title: 'مرحباً بكم في مدرستنا',
        description: 'نحن نقدم أفضل الدورات التعليمية',
        buttonText: 'ابدأ التعلم',
        buttonLink: '#courses'
    };
    
    document.querySelector('.hero h1').textContent = heroSection.title;
    document.querySelector('.hero p').textContent = heroSection.description;
    const heroButton = document.querySelector('.hero .btn');
    heroButton.textContent = heroSection.buttonText;
    heroButton.href = heroButton.buttonLink;
};

// تحديث Hero Section
function updateHeroSection() {
    try {
        const heroData = JSON.parse(localStorage.getItem('heroSection'));
        if (heroData) {
            document.getElementById('heroTitle').textContent = heroData.heading;
            document.getElementById('heroSubtitle').textContent = heroData.subheading;
            const heroButton = document.getElementById('heroButton');
            heroButton.textContent = heroData.buttonText;
            heroButton.href = heroData.buttonLink;

            // تحديث صورة الخلفية
            const heroSection = document.querySelector('.hero');
            if (heroData.backgroundImage) {
                heroSection.style.setProperty('--hero-bg-image', `url(${heroData.backgroundImage})`);
            } else {
                heroSection.style.removeProperty('--hero-bg-image');
            }
        }
    } catch (error) {
        console.error('خطأ في تحديث Hero Section:', error);
    }
}

// تحديث Hero Section عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateHeroSection);

// تحميل المميزات
const loadFeatures = () => {
    const features = JSON.parse(localStorage.getItem('features')) || [];
    const featuresContainer = document.querySelector('#features .row');
    featuresContainer.innerHTML = '';
    
    features.forEach(feature => {
        const featureElement = document.createElement('div');
        featureElement.className = 'col-md-4 mb-4';
        featureElement.innerHTML = `
            <div class="feature-item text-center">
                <i class="${feature.icon}"></i>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `;
        featuresContainer.appendChild(featureElement);
    });
};

// تحميل معلومات الاتصال
const loadContactInfo = () => {
    const contactInfo = JSON.parse(localStorage.getItem('contactInfo')) || {
        email: '',
        phone: '',
        address: '',
        facebook: '',
        twitter: '',
        instagram: ''
    };
    
    document.querySelector('#contact-email').textContent = contactInfo.email;
    document.querySelector('#contact-phone').textContent = contactInfo.phone;
    document.querySelector('#contact-address').textContent = contactInfo.address;
    
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks[0].href = contactInfo.facebook;
    socialLinks[1].href = contactInfo.twitter;
    socialLinks[2].href = contactInfo.instagram;
};

// التحقق من حالة تسجيل الدخول وتحديث زر تسجيل الدخول
const updateLoginButton = () => {
    const loginBtn = document.querySelector('#loginBtn');
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData && userData.name) {
        // إذا كان المستخدم مسجل الدخول
        loginBtn.innerHTML = `
            <i class="fas fa-user"></i>
            ${userData.name}
        `;
        loginBtn.href = "#profile";
        
        // إضافة قائمة منسدلة للملف الشخصي
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'profile-dropdown';
        dropdownMenu.innerHTML = `
            <a href="#profile"><i class="fas fa-user-circle"></i> الملف الشخصي</a>
            <a href="#settings"><i class="fas fa-cog"></i> الإعدادات</a>
            <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</a>
        `;
        
        // إزالة القائمة المنسدلة القديمة إذا وجدت
        const oldDropdown = loginBtn.parentElement.querySelector('.profile-dropdown');
        if (oldDropdown) {
            oldDropdown.remove();
        }
        
        loginBtn.parentElement.appendChild(dropdownMenu);
        
        // إضافة مستمع حدث لزر تسجيل الخروج
        document.querySelector('#logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('userData');
            window.location.reload();
        });
    } else {
        // إذا لم يكن المستخدم مسجل الدخول
        loginBtn.innerHTML = `
            <i class="fas fa-sign-in-alt"></i>
            تسجيل الدخول
        `;
        loginBtn.href = "#login";
        
        // إضافة مستمع حدث لزر تسجيل الدخول
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
};

// دالة لعرض نافذة تسجيل الدخول
const showLoginModal = () => {
    const modal = document.createElement('div');
    modal.className = 'login-modal';
    modal.innerHTML = `
        <div class="login-content">
            <h2>تسجيل الدخول</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-gradient">تسجيل الدخول</button>
            </form>
            <button class="close-modal">×</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إغلاق النافذة
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    // معالجة تسجيل الدخول
    modal.querySelector('#loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = modal.querySelector('#email').value;
        const password = modal.querySelector('#password').value;
        
        // هنا يمكنك إضافة التحقق من صحة البيانات
        // للتجربة سنقوم بتخزين اسم المستخدم مباشرة
        const userData = {
            name: email.split('@')[0],
            email: email
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        modal.remove();
        updateLoginButton();
    });
};

// تحميل الفيديوهات
const loadVideos = async () => {
    try {
        if (!db) {
            await initDB();
        }

        const transaction = db.transaction(['videos'], 'readonly');
        const videoStore = transaction.objectStore('videos');
        const request = videoStore.getAll();

        request.onsuccess = () => {
            const videos = request.result;
            const videosContainer = document.querySelector('#videos .row');
            videosContainer.innerHTML = '';
            
            videos.forEach(video => {
                const videoElement = document.createElement('div');
                videoElement.className = 'col-md-4 mb-4';
                videoElement.innerHTML = `
                    <div class="card">
                        <video class="card-img-top" controls>
                            <source src="${URL.createObjectURL(new Blob([video.data]))}">
                        </video>
                        <div class="card-body">
                            <h5 class="card-title">${video.title}</h5>
                            <p class="card-text">${video.description}</p>
                            <p class="text-muted">التصنيف: ${video.category}</p>
                        </div>
                    </div>
                `;
                videosContainer.appendChild(videoElement);
            });
        };

        request.onerror = () => {
            console.error("خطأ في تحميل الفيديوهات:", request.error);
        };
    } catch (error) {
        console.error("خطأ في تحميل الفيديوهات:", error);
    }
};

// Add loader to the page
document.body.insertAdjacentHTML('afterbegin', `
    <div class="loader-wrapper">
        <div class="loader"></div>
    </div>
`);

// Handle page load transitions
document.addEventListener('DOMContentLoaded', () => {
    // Hide loader after page loads
    setTimeout(() => {
        document.querySelector('.loader-wrapper').classList.add('fade-out');
        document.getElementById('content').classList.add('content-visible');
    }, 1000);

    // Initialize intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all sections and animated elements
    document.querySelectorAll('section, .hero-content, .feature-item, .course-card').forEach(element => {
        observer.observe(element);
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true
});

// Floating Action Button
const mainBtn = document.querySelector('.main-btn');
const subButtons = document.querySelector('.sub-buttons');
let isOpen = false;

mainBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    subButtons.style.display = isOpen ? 'block' : 'none';
    mainBtn.style.transform = isOpen ? 'rotate(45deg)' : 'rotate(0)';
});

// Scroll to Top Button
document.querySelector('.sub-btn:last-child').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Stats Counter Animation
const counters = document.querySelectorAll('.counter');
const speed = 200;

counters.forEach(counter => {
    const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText.replace('+', '');
        const inc = target / speed;

        if (count < target) {
            counter.innerText = Math.ceil(count + inc) + '+';
            setTimeout(updateCount, 1);
        } else {
            counter.innerText = target + '+';
        }
    };

    counter.setAttribute('data-target', counter.innerText.replace('+', ''));
    updateCount();
});

// Feature Cards Hover Effect
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.querySelector('.feature-hover i').style.transform = 'translateX(-10px)';
    });

    card.addEventListener('mouseleave', () => {
        card.querySelector('.feature-hover i').style.transform = 'translateX(0)';
    });
});

// تحميل جميع البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        loadSettings();
        loadHeroSection();
        loadCourses();
        loadFeatures();
        await loadVideos();
        loadContactInfo();
        updateLoginButton();
    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
    }
});

// تهيئة قاعدة البيانات
const dbName = 'AlisioSchoolDB';
const dbVersion = 1;
let db;

// فتح قاعدة البيانات
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error("خطأ في فتح قاعدة البيانات:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("تم فتح قاعدة البيانات بنجاح");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // إنشاء مخزن الطلبات إذا لم يكن موجوداً
            if (!db.objectStoreNames.contains('requests')) {
                const requestStore = db.createObjectStore('requests', { 
                    keyPath: 'id',
                    autoIncrement: true 
                });
                
                // إنشاء الفهارس
                requestStore.createIndex('status', 'status', { unique: false });
                requestStore.createIndex('createdAt', 'createdAt', { unique: false });
                requestStore.createIndex('email', 'email', { unique: false });
                requestStore.createIndex('nationalId', 'nationalId', { unique: true });
                
                console.log("تم إنشاء مخزن الطلبات");
            }
        };
    });
}

// معالجة تقديم النموذج
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // تهيئة قاعدة البيانات عند تحميل الصفحة
        await openDB();
        
        const registrationForm = document.getElementById('registrationForm');
        if (!registrationForm) return;

        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // التحقق من صحة البيانات
            if (!registrationForm.checkValidity()) {
                e.stopPropagation();
                registrationForm.classList.add('was-validated');
                return;
            }

            try {
                // إضافة تأثير التحميل
                registrationForm.classList.add('loading');
                
                // جمع بيانات النموذج
                const formData = {
                    name: document.getElementById('fullName').value,
                    nationalId: document.getElementById('nationalId').value,
                    birthDate: document.getElementById('birthDate').value,
                    gender: document.getElementById('gender').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value,
                    course: document.getElementById('course').value,
                    period: document.getElementById('period').value,
                    message: document.getElementById('message').value,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };

                // التحقق من عدم وجود طلب سابق بنفس رقم الهوية
                const existingRequest = await checkExistingRequest(formData.nationalId);
                if (existingRequest) {
                    showNotification('عذراً، يوجد طلب مسجل مسبقاً بنفس رقم الهوية', 'warning');
                    return;
                }

                // حفظ الطلب في قاعدة البيانات
                await addRequest(formData);

                // إظهار رسالة نجاح
                showNotification('تم إرسال طلبك بنجاح! سنتواصل معك قريباً', 'success');
                
                // إعادة تعيين النموذج
                registrationForm.reset();
                registrationForm.classList.remove('was-validated');

            } catch (error) {
                console.error('خطأ في إرسال الطلب:', error);
                showNotification('عذراً، حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى', 'error');
            } finally {
                registrationForm.classList.remove('loading');
            }
        });
    } catch (error) {
        console.error('خطأ في تهيئة النموذج:', error);
        showNotification('عذراً، حدث خطأ في تحميل النموذج', 'error');
    }
});

// التحقق من وجود طلب سابق
async function checkExistingRequest(nationalId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير متاحة'));
            return;
        }

        const transaction = db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const index = store.index('nationalId');
        const request = index.get(nationalId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// إضافة طلب جديد
async function addRequest(requestData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('قاعدة البيانات غير متاحة'));
            return;
        }

        const transaction = db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        
        // إضافة الطلب
        const request = store.add(requestData);
        
        request.onsuccess = () => {
            console.log('تم حفظ الطلب بنجاح:', request.result);
            resolve(request.result);
        };
        
        request.onerror = () => {
            console.error('خطأ في حفظ الطلب:', request.error);
            reject(request.error);
        };

        // التأكد من إتمام المعاملة
        transaction.oncomplete = () => {
            console.log('تمت المعاملة بنجاح');
        };

        transaction.onerror = () => {
            console.error('خطأ في المعاملة:', transaction.error);
            reject(transaction.error);
        };
    });
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // تحريك الإشعار
    setTimeout(() => notification.classList.add('show'), 100);
    
    // إزالة الإشعار
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}
