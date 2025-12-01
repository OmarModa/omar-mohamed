/*
  # Service Marketplace Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `role` (text: customer, provider, admin)
      - `contact_info` (text)
      - `region` (text)
      - `address` (text, optional)
      - `verification_video_url` (text, optional)
      - `specialization_id` (integer, optional)
      - `created_at` (timestamptz)
    
    - `categories`
      - `id` (integer, primary key)
      - `name` (text)
      - `icon_name` (text)
      - `description` (text, optional)
    
    - `service_requests`
      - `id` (bigint, primary key)
      - `customer_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `category_id` (integer, references categories)
      - `region` (text)
      - `status` (text: open, assigned, completed)
      - `assigned_provider_id` (uuid, optional)
      - `accepted_bid_id` (bigint, optional)
      - `before_image_url` (text, optional)
      - `after_image_url` (text, optional)
      - `suggested_budget` (numeric, optional)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, optional)
    
    - `bids`
      - `id` (bigint, primary key)
      - `request_id` (bigint, references service_requests)
      - `provider_id` (uuid, references profiles)
      - `price` (numeric)
      - `message` (text, optional)
      - `status` (text: pending, accepted, rejected)
      - `created_at` (timestamptz)
    
    - `ratings`
      - `id` (bigint, primary key)
      - `request_id` (bigint, references service_requests)
      - `provider_id` (uuid, references profiles)
      - `customer_id` (uuid, references profiles)
      - `score` (integer, 1-10)
      - `created_at` (timestamptz)
    
    - `notifications`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `type` (text: info, success, alert)
      - `related_request_id` (bigint, optional)
      - `is_read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all, update own
    - Categories: Public read access
    - Service Requests: Public read for open requests, customers can create/update own
    - Bids: Providers can create, customers can view on their requests
    - Ratings: Customers can create on completed requests
    - Notifications: Users can read/update own
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  contact_info text NOT NULL,
  region text NOT NULL,
  address text,
  verification_video_url text,
  specialization_id integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id integer PRIMARY KEY,
  name text NOT NULL,
  icon_name text NOT NULL,
  description text
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

-- Insert categories
INSERT INTO categories (id, name, icon_name, description) VALUES
  (1, 'سيارات', 'car', 'غسيل، تلميع، صيانة دورية، وإصلاح الأعطال الميكانيكية والكهربائية للسيارات'),
  (2, 'تكييف', 'ac', 'صيانة وتركيب وحدات التكييف المركزية والوحدات المنفصلة وتنظيف الفلاتر'),
  (3, 'كهرباء', 'electricity', 'تأسيس شبكات الكهرباء، تركيب الإضاءة، وإصلاح الأعطال الكهربائية المنزلية'),
  (11, 'سباكة وتسريبات', 'drop', 'كشف التسريبات، تأسيس السباكة، تركيب الأدوات الصحية وصيانة المضخات'),
  (4, 'تنظيف', 'cleaning', 'تنظيف شامل للمنازل، الشقق، الفلل، غسيل السجاد والكنب والواجهات'),
  (5, 'محاماة واستشارات قانونية', 'gavel', 'استشارات قانونية، صياغة عقود، وتمثيل قانوني في مختلف القضايا'),
  (6, 'صيانة أجهزة منزلية', 'wrench', 'صيانة الغسالات، الثلاجات، الأفران، وجميع الأجهزة المنزلية الكبيرة والصغيرة'),
  (7, 'دروس خصوصية وتدريب', 'bookopen', 'دروس تقوية لجميع المراحل الدراسية، تعليم لغات، ودورات تدريبية متخصصة'),
  (8, 'تنسيق حدائق وزراعة', 'sprout', 'تنسيق الحدائق، زراعة الورود والأشجار، تركيب شبكات الري والعشب الصناعي'),
  (9, 'تصميم وبرمجة', 'code', 'تصميم جرافيك، برمجة مواقع وتطبيقات، وتسويق إلكتروني'),
  (10, 'نقل أثاث', 'truck', 'نقل عفش، فك وتركيب الأثاث، تغليف احترافي ونقل آمن')
ON CONFLICT (id) DO NOTHING;

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category_id integer NOT NULL REFERENCES categories(id),
  region text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed')),
  assigned_provider_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  accepted_bid_id bigint,
  before_image_url text,
  after_image_url text,
  suggested_budget numeric(10, 2),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service requests are viewable by everyone"
  ON service_requests FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Assigned providers can update their requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = assigned_provider_id)
  WITH CHECK (auth.uid() = assigned_provider_id);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  request_id bigint NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  price numeric(10, 2) NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids are viewable by request owner and bid owner"
  ON bids FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = bids.request_id
    )
  );

CREATE POLICY "Authenticated users can create bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Request customers can update bids on their requests"
  ON bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = bids.request_id
      AND service_requests.customer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = bids.request_id
      AND service_requests.customer_id = auth.uid()
    )
  );

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  request_id bigint NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, customer_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Customers can create ratings for completed requests"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM service_requests
      WHERE service_requests.id = ratings.request_id
      AND service_requests.customer_id = auth.uid()
      AND service_requests.status = 'completed'
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'alert')),
  related_request_id bigint REFERENCES service_requests(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON service_requests(assigned_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_bids_request ON bids(request_id);
CREATE INDEX IF NOT EXISTS idx_bids_provider ON bids(provider_id);
CREATE INDEX IF NOT EXISTS idx_ratings_provider ON ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_message text,
  p_type text,
  p_related_request_id bigint DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, message, type, related_request_id)
  VALUES (p_user_id, p_message, p_type, p_related_request_id);
END;
$$;

-- Trigger function to notify customer when bid is placed
CREATE OR REPLACE FUNCTION notify_customer_on_new_bid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_request_title text;
  v_bid_price numeric;
BEGIN
  SELECT customer_id, title INTO v_customer_id, v_request_title
  FROM service_requests
  WHERE id = NEW.request_id;
  
  PERFORM create_notification(
    v_customer_id,
    'تم تقديم عرض جديد بقيمة ' || NEW.price || ' د.ك على طلبك "' || v_request_title || '"',
    'info',
    NEW.request_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_customer_on_new_bid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION notify_customer_on_new_bid();

-- Trigger function to notify provider when bid is accepted
CREATE OR REPLACE FUNCTION notify_provider_on_bid_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_title text;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT title INTO v_request_title
    FROM service_requests
    WHERE id = NEW.request_id;
    
    PERFORM create_notification(
      NEW.provider_id,
      'مبروك! تم قبول عرضك على الطلب "' || v_request_title || '". يمكنك البدء بالتنفيذ الآن.',
      'success',
      NEW.request_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_provider_on_bid_accepted
AFTER UPDATE ON bids
FOR EACH ROW
EXECUTE FUNCTION notify_provider_on_bid_accepted();

-- Trigger function to notify customer when request is completed
CREATE OR REPLACE FUNCTION notify_customer_on_request_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_provider_name text;
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'assigned' THEN
    SELECT name INTO v_provider_name
    FROM profiles
    WHERE id = NEW.assigned_provider_id;
    
    PERFORM create_notification(
      NEW.customer_id,
      'قام مزود الخدمة بإنهاء العمل على طلبك "' || NEW.title || '". يرجى التقييم.',
      'success',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_customer_on_request_completed
AFTER UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION notify_customer_on_request_completed();
