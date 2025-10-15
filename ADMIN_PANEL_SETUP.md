# Admin Panel Setup Guide

## 🎯 Overview

This guide will help you set up the complete admin panel with the following features:

✅ **User Management** - View all users and manage their roles (admin/user)  
✅ **Quiz Management** - Create, start, end, and delete quizzes  
✅ **Score Tracking** - View all quiz attempts with detailed scores  
✅ **Dashboard** - Real-time statistics and recent activity  
✅ **Role-Based Access** - Only admins can access the admin panel  

---

## 📋 Prerequisites

- Supabase project set up
- Access to Supabase SQL Editor
- Admin user account

---

## 🚀 Setup Instructions

### Step 1: Run the Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `supabase-migration.sql` in your project root
5. Copy the entire SQL content and paste it into the SQL Editor
6. Click **Run** to execute the migration

This will create:
- `quizzes` table - For managing quizzes
- `user_quiz_scores` table - For tracking quiz scores
- Row Level Security (RLS) policies
- Indexes for better performance
- Role field in profiles table (if not exists)

### Step 2: Create Your First Admin User

After running the migration, you need to set at least one user as admin:

```sql
-- Replace 'your-user-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-user-email@example.com';
```

Run this query in the Supabase SQL Editor.

### Step 3: Verify the Setup

1. Log in to your application with the admin user account
2. Navigate to `/admin` route
3. You should see the admin dashboard with 6 tabs:
   - **Dashboard** - Overview and statistics
   - **Users** - User management with role assignment
   - **Quizzes** - Quiz lifecycle management
   - **Scores** - Quiz results and performance
   - **Questions** - Quiz question management
   - **KYC** - KYC requests (if applicable)

---

## 🎨 Features Breakdown

### 1. Dashboard Tab
- **Total Users** - Count of all registered users
- **Active Quizzes** - Number of currently active quizzes
- **Quiz Attempts** - Total quiz attempts
- **Average Score** - Average score across all quizzes
- **Recent Activity** - Latest 5 quiz attempts

### 2. Users Tab
- View all registered users
- **Role Management** - Change user roles between 'admin' and 'user'
- View verification status (email/phone)
- See join dates

### 3. Quizzes Tab
- **Create New Quiz** - Add quizzes with title, description, and question count
- **Start Quiz** - Activate draft quizzes
- **End Quiz** - Complete active quizzes
- **Delete Quiz** - Remove quizzes
- View quiz status (draft/active/completed/cancelled)

### 4. Scores Tab
- View all quiz attempts
- See user names and quiz titles
- **Score Calculation** - Automatic percentage calculation
- Time taken for each quiz
- Completion timestamps
- Color-coded badges (green for 70%+, gray for below)

### 5. Questions Tab
- Add new quiz questions
- Manage existing questions
- Activate/deactivate questions
- Delete questions

### 6. KYC Tab
- View KYC requests (when implemented)
- Approve/reject documents

---

## 🔐 Security Features

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

**Quizzes Table:**
- ✅ Everyone can read quizzes
- ✅ Only admins can create, update, or delete quizzes

**User Quiz Scores Table:**
- ✅ Users can read their own scores
- ✅ Admins can read all scores
- ✅ Users can insert their own scores
- ✅ Users can update their own scores

### Role-Based Access
- Admin panel route (`/admin`) checks user role
- Non-admin users are redirected to dashboard
- All admin functions verify admin role server-side

---

## 📊 Database Schema

### Quizzes Table
```sql
- id (UUID, Primary Key)
- title (TEXT, Required)
- description (TEXT, Optional)
- start_time (TIMESTAMPTZ, Optional)
- end_time (TIMESTAMPTZ, Optional)
- status (TEXT, Default: 'draft')
- total_questions (INTEGER, Default: 10)
- created_at (TIMESTAMPTZ, Default: NOW())
- created_by (UUID, Foreign Key to auth.users)
```

### User Quiz Scores Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- quiz_id (UUID, Foreign Key to quizzes)
- score (INTEGER, Default: 0)
- total_questions (INTEGER, Required)
- correct_answers (INTEGER, Default: 0)
- time_taken_seconds (INTEGER, Optional)
- completed_at (TIMESTAMPTZ, Optional)
- created_at (TIMESTAMPTZ, Default: NOW())
- UNIQUE(user_id, quiz_id)
```

---

## 🎯 Usage Guide

### Creating a Quiz
1. Go to **Quizzes** tab
2. Click **New Quiz** button
3. Fill in:
   - Title (required)
   - Description (optional)
   - Total Questions (default: 10)
   - Status (draft or active)
4. Click **Create Quiz**

### Managing Quiz Lifecycle
- **Draft → Active**: Click **Start** button
- **Active → Completed**: Click **End** button
- **Delete**: Click trash icon (any status)

### Managing User Roles
1. Go to **Users** tab
2. Find the user you want to modify
3. Click the **Role** dropdown
4. Select **Admin** or **User**
5. Role is updated immediately

### Viewing Quiz Scores
1. Go to **Scores** tab
2. View all quiz attempts in a table
3. Scores are color-coded:
   - Green badge: 70% or higher
   - Gray badge: Below 70%
4. See time taken and completion date

---

## 🐛 Troubleshooting

### TypeScript Errors
If you see TypeScript errors about 'never' types:
- These are expected before running the SQL migration
- Run the migration in Supabase
- Restart your development server
- The errors should disappear

### "Access Denied" Message
- Verify your user has role = 'admin' in the profiles table
- Run this query to check:
  ```sql
  SELECT id, email, role FROM public.profiles WHERE email = 'your-email@example.com';
  ```
- If role is NULL or 'user', update it to 'admin'

### Tables Not Found
- Ensure you ran the complete SQL migration
- Check Supabase Table Editor to verify tables exist
- Look for: `quizzes` and `user_quiz_scores` tables

### Data Not Loading
- Check browser console for errors
- Verify RLS policies are applied correctly
- Ensure your admin user is authenticated

---

## 📝 API Endpoints Used

The admin panel uses the following Supabase operations:

### Profiles
- `SELECT *` - Fetch all users
- `UPDATE role` - Update user roles

### Quizzes
- `SELECT *` - Fetch all quizzes
- `INSERT` - Create new quiz
- `UPDATE status, start_time, end_time` - Manage quiz lifecycle
- `DELETE` - Remove quiz

### User Quiz Scores
- `SELECT * WITH profiles, quizzes` - Fetch scores with user and quiz details

---

## 🎨 UI Components Used

- **shadcn/ui** components:
  - Card, CardContent, CardHeader, CardTitle, CardDescription
  - Table, TableHeader, TableBody, TableRow, TableCell, TableHead
  - Button, Badge, Input, Label, Textarea
  - Select, SelectTrigger, SelectValue, SelectContent, SelectItem
  - Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter
  - Tabs, TabsList, TabsTrigger, TabsContent

- **Lucide Icons**:
  - Users, Shield, LogOut, CheckCircle, XCircle
  - BookOpen, BarChart3, PlayCircle, StopCircle
  - Plus, Edit, Trash2, Eye, DollarSign, Loader2

---

## 🔄 Next Steps

1. **Test the Admin Panel**
   - Create a few test quizzes
   - Assign different roles to users
   - Verify score tracking works

2. **Customize as Needed**
   - Adjust quiz fields
   - Add more statistics to dashboard
   - Implement additional admin features

3. **Deploy to Production**
   - Run the same SQL migration on production Supabase
   - Set production admin users
   - Test all features in production

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Ensure all migrations are applied
4. Check RLS policies in Supabase

---

## ✅ Checklist

- [ ] SQL migration executed successfully
- [ ] At least one admin user created
- [ ] Admin panel accessible at `/admin`
- [ ] All 6 tabs visible and functional
- [ ] User role management working
- [ ] Quiz creation working
- [ ] Quiz lifecycle management (start/end) working
- [ ] Score tracking displaying correctly
- [ ] Dashboard statistics showing accurate data

---

**🎉 Congratulations! Your admin panel is now fully set up and ready to use!**
