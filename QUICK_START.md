# 🚀 Quick Start Guide - Admin Panel (Lovable Cloud)

## ⚡ 3-Step Setup

### Step 1: Run SQL Migration (2 minutes)
1. Open **Lovable Dashboard** → **Database/Supabase** → **SQL Editor**
2. Copy content from `supabase-migration.sql` (or see LOVABLE_DATABASE_SETUP.md)
3. Paste and click **Run**

### Step 2: Create Admin User (30 seconds)
```sql
-- Replace with your email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Step 3: Access Admin Panel (10 seconds)
1. Login to your app
2. Navigate to `/admin`
3. Done! 🎉

---

## 🎯 What You Get

### Dashboard Tab
- Total users, active quizzes, quiz attempts, average scores
- Recent activity feed

### Users Tab
- View all users
- **Change roles** (admin/user) with dropdown

### Quizzes Tab
- **Create** new quizzes
- **Start** quizzes (draft → active)
- **End** quizzes (active → completed)
- **Delete** quizzes

### Scores Tab
- View all quiz attempts
- See scores with percentages
- Time taken and completion dates
- Color-coded performance badges

---

## 🔥 Quick Actions

### Create a Quiz
1. Go to **Quizzes** tab
2. Click **New Quiz**
3. Fill title, description, questions count
4. Click **Create**

### Make Someone Admin
1. Go to **Users** tab
2. Find the user
3. Click role dropdown → Select **Admin**

### Start a Quiz
1. Go to **Quizzes** tab
2. Find draft quiz
3. Click **Start** button

### View Quiz Results
1. Go to **Scores** tab
2. See all attempts with scores

---

## ❗ Troubleshooting

**Can't access /admin?**
→ Make sure your user has `role = 'admin'` in profiles table

**Tables not found?**
→ Run the SQL migration in Lovable's Database/Supabase interface

**TypeScript errors?**
→ Restart dev server after running migration (these are temporary)

**How to access Lovable Database?**
→ Lovable Dashboard → Database or Supabase section → SQL Editor

---

## 📚 Full Documentation

- **LOVABLE_DATABASE_SETUP.md** - Lovable Cloud specific setup ⭐
- **ADMIN_PANEL_SETUP.md** - Complete setup guide
- **CHANGES_SUMMARY.md** - All changes made
- **supabase-migration.sql** - Database migration

---

**Need Help?** Check **LOVABLE_DATABASE_SETUP.md** first! 🎓
