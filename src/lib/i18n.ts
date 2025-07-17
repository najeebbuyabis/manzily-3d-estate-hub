import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      billing: "Billing",
      commissions: "Commissions", 
      invoices: "Invoices",
      listProperty: "List Property",
      signIn: "Sign In",
      signOut: "Sign Out",
      developers: "Developers",
      agents: "Agents",
      about: "About",
      contact: "Contact",
      
      // Hero section
      realEstatePlatform: "Real Estate Platform in Kuwait #1",
      findYourPerfect: "Find Your Perfect",
      dreamApartment: "Dream Apartment",
      heroDescription: "Discover luxury apartments with stunning views, modern amenities, and prime locations across Kuwait. Your perfect home is just a click away.",
      virtualTours: "Virtual Tours",
      getStarted: "Get Started",
      
      // Stats
      growthRate: "Growth Rate",
      starReviews: "Star Reviews",
      happyClients: "Happy Clients",
      properties: "Properties",
      
      // Property search and filters
      searchProperties: "Search Properties",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      propertyType: "Property Type",
      apartment: "Apartment",
      villa: "Villa",
      townhouse: "Townhouse",
      studio: "Studio",
      penthouse: "Penthouse",
      
      // Property details
      propertyDetails: "Property Details",
      features: "Features",
      location: "Location",
      contactAgent: "Contact Agent",
      viewDetails: "View Details",
      
      // Authentication
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to your account to continue",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      
      // Common
      currency: "AED",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      apply: "Apply",
      
      // Sections
      searchPremiumApartments: "Search Premium Apartments",
      searchDescription: "Use our advanced filters to find apartments that match your lifestyle and budget",
      featuredApartments: "Featured Apartments",
      featuredDescription: "Hand-picked premium properties with exclusive features",
      propertyLocations: "Property Locations",
      propertyLocationsDescription: "Interactive map showing property locations verified with Kuwait PACI GIS data",
      viewAll: "View All",
      
      // Search and filters
      searchByLocation: "Search by location or area",
      advanced: "Advanced",
      any: "Any",
      
      // Property listing
      noPropertiesFound: "No properties found",
      viewMap: "View Map",
      viewGrid: "View Grid",
      sortBy: "Sort by",
      priceHighToLow: "Price: High to Low",
      priceLowToHigh: "Price: Low to High",
      newest: "Newest First",
      oldest: "Oldest First"
    }
  },
  ar: {
    translation: {
      // Navigation  
      home: "الرئيسية",
      billing: "الفواتير",
      commissions: "العمولات",
      invoices: "الفواتير",
      listProperty: "إدراج عقار",
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      developers: "المطورين",
      agents: "الوكلاء",
      about: "عن الموقع",
      contact: "تواصل معنا",
      
      // Hero section
      realEstatePlatform: "منصة العقارات رقم 1 في الكويت",
      findYourPerfect: "ابحث عن",
      dreamApartment: "الشقة المثالية",
      heroDescription: "اكتشف الشقق الفاخرة ذات الإطلالات الخلابة والمرافق الحديثة والمواقع المميزة في جميع أنحاء الكويت. منزلك المثالي على بُعد نقرة واحدة.",
      virtualTours: "جولات افتراضية",
      getStarted: "ابدأ الآن",
      
      // Stats
      growthRate: "معدل النمو",
      starReviews: "تقييم النجوم",
      happyClients: "عملاء سعداء",
      properties: "عقارات",
      
      // Property search and filters
      searchProperties: "البحث عن العقارات",
      priceRange: "نطاق السعر",
      bedrooms: "غرف النوم",
      bathrooms: "الحمامات",
      propertyType: "نوع العقار",
      apartment: "شقة",
      villa: "فيلا",
      townhouse: "تاون هاوس",
      studio: "استوديو",
      penthouse: "بنتهاوس",
      
      // Property details
      propertyDetails: "تفاصيل العقار",
      features: "المميزات",
      location: "الموقع",
      contactAgent: "تواصل مع الوكيل",
      viewDetails: "عرض التفاصيل",
      
      // Authentication
      loginTitle: "مرحباً بعودتك",
      loginSubtitle: "سجل دخولك إلى حسابك للمتابعة",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      noAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      createAccount: "إنشاء حساب",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      
      // Common
      currency: "درهم",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجح",
      cancel: "إلغاء",
      save: "حفظ",
      delete: "حذف",
      edit: "تعديل",
      search: "بحث",
      filter: "تصفية",
      clear: "مسح",
      apply: "تطبيق",
      
      // Sections
      searchPremiumApartments: "البحث عن الشقق المميزة",
      searchDescription: "استخدم مرشحاتنا المتقدمة للعثور على شقق تناسب نمط حياتك وميزانيتك",
      featuredApartments: "الشقق المميزة",
      featuredDescription: "عقارات مميزة منتقاة بعناية مع ميزات حصرية",
      propertyLocations: "مواقع العقارات",
      propertyLocationsDescription: "خريطة تفاعلية تُظهر مواقع العقارات المتحقق منها باستخدام بيانات PACI GIS الكويتية",
      viewAll: "عرض الكل",
      
      // Search and filters
      searchByLocation: "البحث حسب الموقع أو المنطقة",
      advanced: "متقدم",
      any: "أي",
      
      // Property listing
      noPropertiesFound: "لم يتم العثور على عقارات",
      viewMap: "عرض الخريطة",
      viewGrid: "عرض الشبكة",
      sortBy: "ترتيب حسب",
      priceHighToLow: "السعر: من الأعلى إلى الأقل",
      priceLowToHigh: "السعر: من الأقل إلى الأعلى",
      newest: "الأحدث أولاً",
      oldest: "الأقدم أولاً"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;