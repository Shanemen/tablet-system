# Supabase Setup Guide

This guide will help you set up Supabase for the Buddhist Temple Tablet Application System.

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and sign up (or log in)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `tablet-system` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to your users (e.g., `East Asia (Singapore)` for Asia)
   - **Pricing Plan**: Start with **Free tier** (upgrade to Pro later if needed)
4. Click "Create new project" and wait 2-3 minutes for setup

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

## Step 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file (it's already in `.gitignore`, so it won't be committed)

## Step 4: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/migrations/20241117_initial_schema.sql` in your code editor
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press `Cmd + Enter`)

You should see a success message. This creates all the necessary tables:
- ✅ `ceremony` - Buddhist ceremonies
- ✅ `application` - Devotee applications
- ✅ `application_name` - Tablet names
- ✅ `plaque_job` - Batch generation jobs
- ✅ `plaque_chunk` - Processing chunks
- ✅ `plaque_template` - Template metadata
- ✅ `plaque_asset` - Generated PDF files
- ✅ `audit_log` - Audit trail

## Step 5: Verify Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see all 8 tables listed
3. Click on `plaque_template` - you should see 6 rows (seed data for each tablet type)

## Step 6: Insert Test Data

We'll create test data to populate the dashboard. In SQL Editor, run:

```sql
-- Insert a test ceremony
INSERT INTO ceremony (name_zh, name_en, slug, start_at, deadline_at, location, status) VALUES
  ('2024年3月15日 三時繫念法會', '2024 March 15 - San Shi Xi Nian Ceremony', '2024-03-15-ceremony', '2024-03-15 14:00:00', '2024-03-10 23:59:59', '淨土道場', 'active');

-- Get the ceremony ID (should be 1)
-- Now insert test applications (replace ceremony_id with actual ID if different)
INSERT INTO application (ceremony_id, applicant_name, phone, email, plaque_type, status, pinyin_key) VALUES
  (1, '王小明', '0912345678', 'wang@example.com', 'longevity', 'pending', 'wang xiao ming'),
  (1, '李美華', '0923456789', 'li@example.com', 'deceased', 'pending', 'li mei hua'),
  (1, '張大偉', '0934567890', 'zhang@example.com', 'ancestors', 'pending', 'zhang da wei'),
  (1, '陳淑芬', '0945678901', 'chen@example.com', 'karmic_creditors', 'exported', 'chen shu fen'),
  (1, '林志明', '0956789012', 'lin@example.com', 'aborted_spirits', 'pending', 'lin zhi ming'),
  (1, '黃美玲', '0967890123', 'huang@example.com', 'land_deity', 'pending', 'huang mei ling'),
  (1, '吳建國', '0978901234', 'wu@example.com', 'longevity', 'problematic', 'wu jian guo'),
  (1, '劉秀英', '0989012345', 'liu@example.com', 'deceased', 'exported', 'liu xiu ying'),
  (1, '鄭家豪', '0990123456', 'zheng@example.com', 'ancestors', 'pending', 'zheng jia hao'),
  (1, '楊文傑', '0901234567', 'yang@example.com', 'deceased', 'pending', 'yang wen jie');

-- Insert tablet names for each application
INSERT INTO application_name (application_id, display_name, pinyin_key) VALUES
  (1, '王大明', 'wang da ming'),
  (1, '王小華', 'wang xiao hua'),
  (2, '李老太太', 'li lao tai tai'),
  (3, '張氏歷代祖先', 'zhang shi li dai zu xian'),
  (4, '陳氏冤親債主', 'chen shi yuan qin zhai zhu'),
  (5, '林家墮胎嬰靈', 'lin jia duo tai ying ling'),
  (6, '黃府地基主', 'huang fu di ji zhu'),
  (7, '吳先生', 'wu xian sheng'),
  (8, '劉女士', 'liu nu shi'),
  (9, '鄭氏祖先', 'zheng shi zu xian'),
  (10, '楊先生', 'yang xian sheng');
```

## Step 7: Test Your Setup

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000/admin/dashboard`

3. You should see:
   - ✅ Statistics showing 10 total applications
   - ✅ 6 pending applications
   - ✅ 2 exported applications  
   - ✅ 1 problematic application
   - ✅ Application table with real data from Supabase

## Troubleshooting

### Error: "supabaseUrl is required"
- Check that `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL`
- Restart your dev server after changing `.env.local`

### Error: "Invalid API key"
- Double-check that you copied the full anon key (it's very long!)
- Make sure there are no extra spaces or line breaks

### Tables not showing in Table Editor
- Make sure the SQL migration ran without errors
- Check for red error messages in SQL Editor
- Try refreshing the page

### Dashboard shows "Loading..." forever
- Open browser DevTools → Console tab
- Look for error messages
- Common issues: CORS errors (check Supabase settings), API key mismatch

## Next Steps

Once your dashboard shows real data from Supabase:
1. ✅ Commit your changes (excluding `.env.local`)
2. ✅ Move on to implementing admin authentication
3. ✅ Add batch export functionality with real database queries

## Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit API keys to Git
- ✅ Use `NEXT_PUBLIC_` prefix only for anon key (safe for browser)
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-only)
- ❌ Don't share your service role key in public channels

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

