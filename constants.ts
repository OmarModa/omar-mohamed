
import type { User, Category, ServiceRequest, Bid, Rating, AppNotification } from './types';
import { UserRole, RequestStatus, BidStatus } from './types';
import {
    CarIcon, AcIcon, ElectricityIcon, CleaningIcon,
    GavelIcon, WrenchIcon, BookOpenIcon, SproutIcon, CodeIcon, TruckIcon, DropIcon,
    PaletteIcon, MegaphoneIcon, HammerIcon, SatelliteIcon, PartyPopperIcon, CoffeeIcon, HeartPulseIcon, PackageIcon, ScissorsIcon, HeartIcon
} from './components/icons';

export const CATEGORIES: Category[] = [
  { id: 1, name: 'سيارات', icon: CarIcon },
  { id: 2, name: 'التكييف والتهوية', icon: AcIcon },
  { id: 3, name: 'كهرباء', icon: ElectricityIcon },
  { id: 4, name: 'التنظيف', icon: CleaningIcon },
  { id: 5, name: 'محاماة واستشارات قانونية', icon: GavelIcon },
  { id: 6, name: 'صيانة أجهزة منزلية', icon: WrenchIcon },
  { id: 7, name: 'الدروس الخصوصية', icon: BookOpenIcon },
  { id: 8, name: 'تنسيق حدائق وزراعة', icon: SproutIcon },
  { id: 9, name: 'التصميم والجرافيك', icon: PaletteIcon },
  { id: 10, name: 'نقل العفش', icon: TruckIcon },
  { id: 11, name: 'سباكة وتسريبات', icon: DropIcon },
  { id: 12, name: 'خدمات الويب والتسويق', icon: CodeIcon },
  { id: 13, name: 'الطباعة والدعاية', icon: MegaphoneIcon },
  { id: 14, name: 'المقاولات والترميم', icon: HammerIcon },
  { id: 15, name: 'النجارة والحدادة', icon: HammerIcon },
  { id: 16, name: 'خدمات الستلايت', icon: SatelliteIcon },
  { id: 17, name: 'تجهيز الحفلات', icon: PartyPopperIcon },
  { id: 18, name: 'الضيافة', icon: CoffeeIcon },
  { id: 19, name: 'الرعاية الصحية المنزلية', icon: HeartPulseIcon },
  { id: 20, name: 'التوصيل', icon: PackageIcon },
  { id: 21, name: 'صالون تجميل', icon: ScissorsIcon },
  { id: 22, name: 'تطوع وخدمات مجانية', icon: HeartIcon },
];

export const REGIONS = [
    'العاصمة', 'حولي', 'السالمية', 'الفروانية', 'الجهراء', 'الأحمدي', 'مبارك الكبير', 'صباح السالم', 'الجابرية', 'خيطان'
];

export const USERS: User[] = [
  { 
      id: 1, 
      name: 'أحمد محمود', 
      role: UserRole.Customer, 
      contactInfo: '98765432', 
      region: 'السالمية', 
      address: 'قطعة 5، شارع سالم المبارك، منزل 12',
      registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) 
  },
  { 
      id: 2, 
      name: 'ورشة النور', 
      role: UserRole.Provider, 
      contactInfo: '65432109', 
      region: 'الشويخ',
      registeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      verificationVideoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Sample video
      specializationId: 1 // Cars
  },
  { 
      id: 3, 
      name: 'فاطمة علي', 
      role: UserRole.Customer, 
      contactInfo: '99887766', 
      region: 'حولي', 
      address: 'قطعة 3، شارع بيروت، بناية 4، شقة 10',
      registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) 
  },
  { id: 4, name: 'شركة البرق للتكييف', role: UserRole.Provider, contactInfo: '55443322', region: 'الفروانية', registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), specializationId: 2 }, // AC
  { id: 5, name: 'خالد عبدالله', role: UserRole.Provider, contactInfo: '66778899', region: 'السالمية', registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), specializationId: 3 }, // Electricity
  { id: 6, name: 'المشرف العام', role: UserRole.Admin, contactInfo: 'admin@service.kw', region: 'العاصمة', registeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 7, name: 'فواز للسباكة', role: UserRole.Provider, contactInfo: '90908080', region: 'الجابرية', registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), specializationId: 11 }, // Plumbing
];

export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 1,
    customerId: 1,
    title: 'أحتاج غسيل سيارة فوري',
    description: 'سيارتي من نوع تويوتا كامري موديل 2022، أحتاج غسيل داخلي وخارجي كامل في أسرع وقت ممكن.',
    categoryId: 1,
    region: 'السالمية',
    status: RequestStatus.Open,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    beforeImageUrl: 'https://placehold.co/600x400/9ca3af/ffffff/png?text=%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9+%D9%82%D8%A8%D9%84+%D8%A7%D9%84%D8%BA%D8%B3%D9%8A%D9%84',
    suggestedBudget: 10,
  },
  {
    id: 2,
    customerId: 3,
    title: 'المكيف لا يبرد جيداً',
    description: 'لدي مكيف سبليت في غرفة الجلوس توقف عن التبريد بشكل مفاجئ. يصدر صوت ولكن الهواء ليس بارد.',
    categoryId: 2,
    region: 'حولي',
    status: RequestStatus.Assigned,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    assignedProviderId: 4,
    acceptedBidId: 3,
  },
  {
    id: 3,
    customerId: 1,
    title: 'تركيب إضاءة جديدة في السقف',
    description: 'اشتريت إضاءة LED جديدة وأريد كهربائي لتركيبها في سقف غرفة النوم.',
    categoryId: 3,
    region: 'السالمية',
    status: RequestStatus.Completed,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
    assignedProviderId: 5,
    acceptedBidId: 5,
    beforeImageUrl: 'https://placehold.co/600x400/9ca3af/ffffff/png?text=%D8%BA%D8%B1%D9%81%D8%A9+%D9%82%D8%A8%D9%84+%D8%A7%D9%84%D8%AA%D8%B1%D9%83%D9%8A%D8%A8',
    afterImageUrl: 'https://placehold.co/600x400/14b8a6/ffffff/png?text=%D8%A7%D9%84%D8%BA%D8%B1%D9%81%D8%A9+%D8%A8%D8%B9%D8%AF+%D8%A7%D9%84%D8%AA%D8%B1%D9%83%D9%8A%D8%A8',
  },
  {
    id: 4,
    customerId: 3,
    title: 'تنظيف شامل للمنزل قبل مناسبة',
    description: 'أحتاج خدمة تنظيف شاملة للمنزل (3 غرف وصالة) استعداداً لمناسبة عائلية. يشمل تنظيف النوافذ والأرضيات.',
    categoryId: 4,
    region: 'حولي',
    status: RequestStatus.Open,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    suggestedBudget: 25,
  },
  // New specific request for the scenario
  {
    id: 5,
    customerId: 1,
    title: 'تصليح تسريب مياه شديد في الحمام',
    description: 'يوجد تسريب مياه قوي أسفل المغسلة في الحمام الرئيسي، أحتاج سباك ماهر لإصلاحه وتغيير التمديدات إذا لزم الأمر. يفضل الحضور اليوم.',
    categoryId: 11,
    region: 'السالمية',
    status: RequestStatus.Open,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
];

export const BIDS: Bid[] = [
  { id: 1, requestId: 1, providerId: 2, price: 15, status: BidStatus.Pending },
  { id: 2, requestId: 1, providerId: 5, price: 12, message: "يمكنني البدء خلال ساعة", status: BidStatus.Pending },
  { id: 3, requestId: 2, providerId: 4, price: 25, message: "يشمل فحص الفريون", status: BidStatus.Accepted },
  { id: 4, requestId: 2, providerId: 5, price: 30, status: BidStatus.Rejected },
  { id: 5, requestId: 3, providerId: 5, price: 10, status: BidStatus.Accepted },
  
  // Bids for the new Plumbing Request (ID 5)
  { id: 6, requestId: 5, providerId: 2, price: 20, message: "شامل قطع الغيار البسيطة", status: BidStatus.Pending },
  { id: 7, requestId: 5, providerId: 5, price: 15, message: "أستطيع الوصول خلال نصف ساعة", status: BidStatus.Pending },
  { id: 8, requestId: 5, providerId: 7, price: 18, message: "خبرة 10 سنوات في السباكة", status: BidStatus.Pending },
];

export const RATINGS: Rating[] = [
  { id: 1, requestId: 3, providerId: 5, customerId: 1, score: 9 },
];

export const NOTIFICATIONS: AppNotification[] = [
    {
        id: 1,
        userId: 1,
        message: 'تم تلقي عرض جديد على طلبك "أحتاج غسيل سيارة فوري"',
        type: 'info',
        relatedRequestId: 1,
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
        id: 2,
        userId: 4,
        message: 'تم قبول عرضك على طلب "المكيف لا يبرد جيداً"! يرجى البدء في التنفيذ.',
        type: 'success',
        relatedRequestId: 2,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
];
