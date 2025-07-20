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
      heroDescription: "Discover luxury homes with stunning views, modern amenities, and prime locations across Kuwait. Your perfect home is just a click away.",
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
      house: "House",
      farm: "Farm",
      beachHouse: "Beach House",
      stable: "Stable",
      land: "Land",
      
      // Rental periods
      daily: "Daily",
      monthly: "Monthly",
      yearly: "Yearly",
      perDay: "per day",
      perMonth: "per month",
      perYear: "per year",
      
      // Listing types
      forRent: "For Rent",
      forSale: "For Sale",
      listingType: "Listing Type",
      rentalPeriod: "Rental Period",
      
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
      searchPremiumApartments: "Search Premium Homes",
      searchDescription: "Use our advanced filters to find homes that match your lifestyle and budget",
      featuredApartments: "Featured Homes",
      featuredDescription: "Hand-picked premium properties with exclusive features",
      propertyLocations: "Property Locations",
      propertyLocationsDescription: "Interactive map showing property locations verified with Kuwait PACI GIS data",
      viewAll: "View All",
      
      // Search and filters
      searchByLocation: "Search by location or area",
      advanced: "Advanced",
      any: "Any",
      
      // PACI Validation
      paciPropertyValidation: "PACI Property Validation",
      paciDescription: "Validate property civil numbers with Kuwait's Public Authority for Civil Information (PACI)",
      validate: "Validate",
      connectedToPaci: "Connected to Kuwait PACI GIS System ✓",
      realTimeValidation: "Real-time property validation ✓",
      officialRecords: "Official government records ✓",
      propertyLocationMap: "Property Location Map",
      mapboxTokenDescription: "To display property locations on the map, please enter your Mapbox public token. You can get one from mapbox.com",
      loadMap: "Load Map",
      enterMapboxToken: "Enter Mapbox public token",
      verifiedWithPaci: "Verified with Kuwait PACI GIS",
      paciVerificationDescription: "All property locations are verified through Kuwait's Public Authority for Civil Information (PACI) Geographic Information System to ensure accuracy and prevent duplicate listings",
      noDuplicates: "No Duplicates",
      verifiedProperties: "Verified Properties",
      accurateLocations: "Accurate Locations",
      noDuplicatesDesc: "Civil numbers prevent duplicate listings",
      verifiedPropertiesDesc: "All listings validated with PACI",
      accurateLocationsDesc: "Precise coordinates from official records",
      
      // Property listings
      availableApartments: "Available Homes",
      propertiesFound: "properties found",
      civilId: "Civil ID:",
      
      // Footer
      contactSection: "Contact",
      servicesSection: "Services",
      propertiesSection: "Properties",
      propertyManagement: "Property Management",
      investmentAdvice: "Investment Advice",
      legalSupport: "Legal Support",
      studios: "Studios",
      duplexes: "Duplexes",
      trustedPartner: "Your trusted partner in finding the perfect home in Kuwait",
      allRightsReserved: "Manzily Real Estate Platform. All rights reserved 2024 ©",
      
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
      dreamApartment: "منزلك المثالي",
      heroDescription: "اكتشف المنازل الفاخرة ذات الإطلالات الخلابة والمرافق الحديثة والمواقع المميزة في جميع أنحاء الكويت. منزلك المثالي على بُعد نقرة واحدة.",
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
      house: "منزل",
      farm: "مزرعة",
      beachHouse: "بيت شاطئي",
      stable: "اسطبل",
      land: "أرض",
      
      // Rental periods
      daily: "يومي",
      monthly: "شهري",
      yearly: "سنوي",
      perDay: "يومياً",
      perMonth: "شهرياً",
      perYear: "سنوياً",
      
      // Listing types
      forRent: "للإيجار",
      forSale: "للبيع",
      listingType: "نوع الإعلان",
      rentalPeriod: "فترة الإيجار",
      
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
      searchPremiumApartments: "البحث عن المنازل المميزة",
      searchDescription: "استخدم مرشحاتنا المتقدمة للعثور على منازل تناسب نمط حياتك وميزانيتك",
      featuredApartments: "المنازل المميزة",
      featuredDescription: "عقارات مميزة منتقاة بعناية مع ميزات حصرية",
      propertyLocations: "مواقع العقارات",
      propertyLocationsDescription: "خريطة تفاعلية تُظهر مواقع العقارات المتحقق منها باستخدام بيانات PACI GIS الكويتية",
      viewAll: "عرض الكل",
      
      // Search and filters
      searchByLocation: "البحث حسب الموقع أو المنطقة",
      advanced: "متقدم",
      any: "أي",
      
      // PACI Validation
      paciPropertyValidation: "التحقق من العقارات PACI",
      paciDescription: "التحقق من أرقام العقارات المدنية مع الهيئة العامة للمعلومات المدنية في الكويت (PACI)",
      validate: "تحقق",
      connectedToPaci: "متصل بنظام PACI GIS الكويتي ✓",
      realTimeValidation: "التحقق من العقار في الوقت الفعلي ✓",
      officialRecords: "السجلات الحكومية الرسمية ✓",
      propertyLocationMap: "خريطة مواقع العقارات",
      mapboxTokenDescription: "لعرض مواقع العقارات على الخريطة، يرجى إدخال رمز Mapbox العام الخاص بك. يمكنك الحصول على واحد من mapbox.com",
      loadMap: "تحميل الخريطة",
      enterMapboxToken: "أدخل رمز Mapbox العام",
      verifiedWithPaci: "متحقق منه مع PACI GIS الكويتي",
      paciVerificationDescription: "يتم التحقق من جميع مواقع العقارات من خلال نظام المعلومات الجغرافية للهيئة العامة للمعلومات المدنية (PACI) في الكويت لضمان الدقة ومنع الإدراجات المكررة",
      noDuplicates: "لا توجد مكررات",
      verifiedProperties: "عقارات متحقق منها",
      accurateLocations: "مواقع دقيقة",
      noDuplicatesDesc: "الأرقام المدنية تمنع الإدراجات المكررة",
      verifiedPropertiesDesc: "جميع الإدراجات متحقق منها مع PACI",
      accurateLocationsDesc: "إحداثيات دقيقة من السجلات الرسمية",
      
      // Property listings
      availableApartments: "المنازل المتاحة",
      propertiesFound: "عقار موجود",
      civilId: "الرقم المدني:",
      
      // Footer
      contactSection: "تواصل معنا",
      servicesSection: "خدماتنا",
      propertiesSection: "العقارات",
      propertyManagement: "إدارة العقارات",
      investmentAdvice: "نصائح الاستثمار",
      legalSupport: "الدعم القانوني",
      studios: "استوديوهات",
      duplexes: "دوبلكس",
      trustedPartner: "شريكك الموثوق في العثور على المنزل المثالي في الكويت",
      allRightsReserved: "منصة منزلي العقارية. جميع الحقوق محفوظة 2024 ©",
      
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