
import type { User, Category, ServiceRequest, Bid, Rating } from './types';
import { UserRole, RequestStatus, BidStatus } from './types';
import { 
    CarIcon, AcIcon, ElectricityIcon, CleaningIcon, 
    GavelIcon, WrenchIcon, BookOpenIcon, SproutIcon, CodeIcon, TruckIcon 
} from './components/icons';

export const USERS: User[] = [
  { id: 1, name: 'أحمد محمود', role: UserRole.Customer, contactInfo: '98765432', registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 2, name: 'ورشة النور', role: UserRole.Provider, contactInfo: '65432109', registeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
  { id: 3, name: 'فاطمة علي', role: UserRole.Customer, contactInfo: '99887766', registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 4, name: 'شركة البرق للتكييف', role: UserRole.Provider, contactInfo: '55443322', registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 5, name: 'خالد عبدالله', role: UserRole.Provider, contactInfo: '66778899', registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 6, name: 'المشرف العام', role: UserRole.Admin, contactInfo: 'admin@service.kw', registeredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
];

export const CATEGORIES: Category[] = [
  { id: 1, name: 'سيارات', icon: CarIcon },
  { id: 2, name: 'تكييف', icon: AcIcon },
  { id: 3, name: 'كهرباء', icon: ElectricityIcon },
  { id: 4, name: 'تنظيف', icon: CleaningIcon },
  { id: 5, name: 'محاماة واستشارات قانونية', icon: GavelIcon },
  { id: 6, name: 'صيانة أجهزة منزلية', icon: WrenchIcon },
  { id: 7, name: 'دروس خصوصية وتدريب', icon: BookOpenIcon },
  { id: 8, name: 'تنسيق حدائق وزراعة', icon: SproutIcon },
  { id: 9, name: 'تصميم وبرمجة', icon: CodeIcon },
  { id: 10, name: 'نقل أثاث', icon: TruckIcon },
];

export const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 1,
    customerId: 1,
    title: 'أحتاج غسيل سيارة فوري',
    description: 'سيارتي من نوع تويوتا كامري موديل 2022، أحتاج غسيل داخلي وخارجي كامل في أسرع وقت ممكن. أنا متواجد في حي الياسمين.',
    categoryId: 1,
    status: RequestStatus.Open,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    beforeImageUrl: 'https://placehold.co/600x400/9ca3af/ffffff/png?text=%D8%B3%D9%8A%D8%A7%D8%B1%D8%A9+%D9%82%D8%A8%D9%84+%D8%A7%D9%84%D8%BA%D8%B3%D9%8A%D9%84',
  },
  {
    id: 2,
    customerId: 3,
    title: 'المكيف لا يبرد جيداً',
    description: 'لدي مكيف سبليت في غرفة الجلوس توقف عن التبريد بشكل مفاجئ. يصدر صوت ولكن الهواء ليس بارد.',
    categoryId: 2,
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
    status: RequestStatus.Completed,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
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
    status: RequestStatus.Open,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
];

export const BIDS: Bid[] = [
  { id: 1, requestId: 1, providerId: 2, price: 15, status: BidStatus.Pending },
  { id: 2, requestId: 1, providerId: 5, price: 12, message: "يمكنني البدء خلال ساعة", status: BidStatus.Pending },
  { id: 3, requestId: 2, providerId: 4, price: 25, message: "يشمل فحص الفريون", status: BidStatus.Accepted },
  { id: 4, requestId: 2, providerId: 5, price: 30, status: BidStatus.Rejected },
  { id: 5, requestId: 3, providerId: 5, price: 10, status: BidStatus.Accepted },
];

export const RATINGS: Rating[] = [
  { id: 1, requestId: 3, providerId: 5, customerId: 1, score: 9 },
];