const translations = {
    ar: {
        // Navigation
        home: "الرئيسية",
        courses: "الدورات",
        about: "عن المدرسة",
        contact: "اتصل بنا",
        login: "تسجيل الدخول",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        
        // Hero Section
        welcomeTitle: "مرحباً بكم في مدرسة ALISIO",
        welcomeSubtitle: "ابدأ رحلة التعلم معنا",
        getStarted: "ابدأ الآن",
        
        // Featured Courses
        featuredCourses: "الدورات المميزة",
        viewCourse: "عرض الدورة",
        
        // Why Choose Us
        whyChooseUs: "لماذا تختار ALISIO",
        qualityEducation: "تعليم عالي الجودة",
        expertTeachers: "معلمون خبراء",
        flexibleLearning: "تعلم مرن",
        
        // Footer
        quickLinks: "روابط سريعة",
        followUs: "تابعنا",
        allRightsReserved: "جميع الحقوق محفوظة"
    },
    en: {
        // Navigation
        home: "Home",
        courses: "Courses",
        about: "About",
        contact: "Contact",
        login: "Login",
        profile: "Profile",
        logout: "Logout",
        
        // Hero Section
        welcomeTitle: "Welcome to ALISIO SCHOOL",
        welcomeSubtitle: "Start Your Learning Journey With Us",
        getStarted: "Get Started",
        
        // Featured Courses
        featuredCourses: "Featured Courses",
        viewCourse: "View Course",
        
        // Why Choose Us
        whyChooseUs: "Why Choose ALISIO",
        qualityEducation: "Quality Education",
        expertTeachers: "Expert Teachers",
        flexibleLearning: "Flexible Learning",
        
        // Footer
        quickLinks: "Quick Links",
        followUs: "Follow Us",
        allRightsReserved: "All Rights Reserved"
    },
    fr: {
        // Navigation
        home: "Accueil",
        courses: "Cours",
        about: "À propos",
        contact: "Contact",
        login: "Connexion",
        profile: "Profil",
        logout: "Déconnexion",
        
        // Hero Section
        welcomeTitle: "Bienvenue à l'École ALISIO",
        welcomeSubtitle: "Commencez votre voyage d'apprentissage avec nous",
        getStarted: "Commencer",
        
        // Featured Courses
        featuredCourses: "Cours en vedette",
        viewCourse: "Voir le cours",
        
        // Why Choose Us
        whyChooseUs: "Pourquoi choisir ALISIO",
        qualityEducation: "Éducation de qualité",
        expertTeachers: "Professeurs experts",
        flexibleLearning: "Apprentissage flexible",
        
        // Footer
        quickLinks: "Liens rapides",
        followUs: "Suivez-nous",
        allRightsReserved: "Tous droits réservés"
    }
};

// Function to change the language
function changeLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Store the selected language in localStorage
    localStorage.setItem('selectedLanguage', lang);
}

// Initialize language based on stored preference or default to Arabic
document.addEventListener('DOMContentLoaded', () => {
    const storedLang = localStorage.getItem('selectedLanguage') || 'ar';
    changeLanguage(storedLang);
});
