# Backend Setup Guide

## Overview

This service marketplace uses Supabase as the backend, providing:
- PostgreSQL database with full schema
- Row Level Security (RLS) for data protection
- Real-time notifications
- User authentication
- Automatic triggers for notifications

## Database Schema

### Tables Created

1. **profiles** - User profiles (customers, providers, admins)
2. **categories** - Service categories
3. **service_requests** - Customer service requests
4. **bids** - Provider bids on requests
5. **ratings** - Service ratings (1-10 scale)
6. **notifications** - User notifications

### Automatic Features

- **Notifications**: Automatically created when:
  - New bid is placed (notifies customer)
  - Bid is accepted (notifies provider)
  - Request is completed (notifies customer)

- **Security**: Full RLS policies ensure:
  - Users can only update their own data
  - Customers control their requests
  - Providers can only update assigned requests
  - All data properly secured

## Setup Instructions

### 1. Supabase Project Setup

1. Go to https://supabase.com and create a new project
2. Wait for the database to be provisioned
3. Note your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Migration

The database schema has been automatically applied. You can verify by checking:
- Go to Supabase Dashboard > Table Editor
- You should see all 6 tables created

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

## API Usage

The backend API is available through `lib/api.ts`. Here are the main operations:

### Authentication

```typescript
import { api } from './lib/api';

// Sign up
await api.auth.signUp('email@example.com', 'password', {
  name: 'User Name',
  role: 'customer',
  contact_info: '12345678',
  region: 'السالمية',
  address: 'Optional address'
});

// Sign in
await api.auth.signIn('email@example.com', 'password');

// Sign out
await api.auth.signOut();

// Get current user
const user = await api.auth.getCurrentUser();
```

### Service Requests

```typescript
// Get all requests
const requests = await api.requests.getAll();

// Filter requests
const openRequests = await api.requests.getAll({ status: 'open' });

// Get by ID
const request = await api.requests.getById(1);

// Create request
const newRequest = await api.requests.create({
  customer_id: userId,
  title: 'Request title',
  description: 'Description',
  category_id: 1,
  region: 'السالمية',
  suggested_budget: 50
});

// Update request
await api.requests.update(requestId, { status: 'completed' });

// Accept bid
await api.requests.acceptBid(requestId, bidId, providerId);
```

### Bids

```typescript
// Get bids for a request
const bids = await api.bids.getByRequestId(requestId);

// Create bid
const bid = await api.bids.create({
  request_id: requestId,
  provider_id: providerId,
  price: 25.50,
  message: 'Optional message'
});
```

### Ratings

```typescript
// Create rating
await api.ratings.create({
  request_id: requestId,
  provider_id: providerId,
  customer_id: customerId,
  score: 9
});

// Get provider ratings
const ratings = await api.ratings.getByProviderId(providerId);
```

### Notifications

```typescript
// Get user notifications
const notifications = await api.notifications.getByUserId(userId);

// Mark as read
await api.notifications.markAsRead(notificationId);

// Subscribe to real-time notifications
const subscription = api.notifications.subscribe(userId, (notification) => {
  console.log('New notification:', notification);
});

// Unsubscribe when done
subscription.unsubscribe();
```

### Profiles

```typescript
// Get all profiles
const profiles = await api.profiles.getAll();

// Get by ID
const profile = await api.profiles.getById(userId);

// Update profile
await api.profiles.update(userId, {
  verification_video_url: 'https://...',
  address: 'New address'
});
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with proper policies:

- **Profiles**: Public read, users can update own profile
- **Service Requests**: Public read, customers can create/update own
- **Bids**: Visible to request participants, providers can create
- **Ratings**: Public read, customers can rate completed services
- **Notifications**: Users can only see their own

### Data Validation

- Email uniqueness enforced by Supabase Auth
- Check constraints on status fields
- Foreign key relationships maintained
- Unique constraint on ratings (one rating per request per customer)

## Database Triggers

### notify_customer_on_new_bid
Automatically creates notification when provider places bid

### notify_provider_on_bid_accepted
Automatically creates notification when customer accepts bid

### notify_customer_on_request_completed
Automatically creates notification when provider completes request

## Testing

You can test the backend using the Supabase Dashboard:

1. Go to Table Editor to view/edit data
2. Go to Authentication to manage users
3. Go to Database > Functions to test SQL functions
4. Go to Database > Triggers to verify trigger setup

## Common Operations

### Create Test User

```sql
-- Insert test customer profile (after auth signup)
INSERT INTO profiles (id, name, role, contact_info, region)
VALUES ('user-uuid', 'Test Customer', 'customer', '12345678', 'السالمية');
```

### Query Provider Ratings

```sql
SELECT
  p.name,
  AVG(r.score) as avg_rating,
  COUNT(r.id) as rating_count
FROM profiles p
LEFT JOIN ratings r ON r.provider_id = p.id
WHERE p.role = 'provider'
GROUP BY p.id, p.name
ORDER BY avg_rating DESC;
```

### Get Active Requests by Region

```sql
SELECT
  sr.*,
  p.name as customer_name,
  c.name as category_name
FROM service_requests sr
JOIN profiles p ON p.id = sr.customer_id
JOIN categories c ON c.id = sr.category_id
WHERE sr.status = 'open'
  AND sr.region = 'السالمية'
ORDER BY sr.created_at DESC;
```

## Troubleshooting

### Cannot connect to Supabase
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check if .env.local file exists in project root
- Restart dev server after changing env variables

### RLS Policy Errors
- Ensure user is authenticated before operations
- Check RLS policies in Supabase Dashboard > Authentication > Policies
- Verify user has proper role in profiles table

### Notification Not Created
- Check if triggers are enabled
- Verify create_notification function exists
- Check Supabase logs for errors

## Next Steps

To integrate the backend with your existing frontend:

1. Replace mock data with API calls
2. Add authentication flow
3. Implement real-time subscriptions
4. Add image upload to Supabase Storage
5. Add email notifications using Supabase Functions

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policies in Dashboard
- Check server logs in Supabase Dashboard
