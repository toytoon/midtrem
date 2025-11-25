# 🚀 Quick Start Deployment Guide

## Choose Your Deployment Platform

### ⭐ **Recommended: Vercel** (Easiest)

**Pros**: 
- Free tier
- GitHub integration
- Auto-deploys on push
- Fast global CDN
- Easy environment variables

**Deployment Steps**:

```bash
# 1. Build project
npm run build

# 2. Initialize Git (if needed)
git init
git add .
git commit -m "Initial commit"

# 3. Push to GitHub
git push origin main
```

Then:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select your GitHub repository
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL` = your supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your supabase key
7. Click "Deploy"

**Done!** Your app is live at `your-project.vercel.app`

---

### 🟢 **Option 2: Netlify** (Also Easy)

**Deployment Steps**:

```bash
# Build
npm run build
git push origin main
```

Then:
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Build settings:
   - Command: `npm run build`
   - Publish: `dist`
5. Deploy

**Live at**: `your-project.netlify.app`

---

### 🔵 **Option 3: Supabase Hosting**

Perfect since you're using Supabase for database!

```bash
# Build & push to GitHub
npm run build
git push origin main
```

Then:
1. Go to supabase.com
2. Go to your project
3. Click "Deployments"
4. Connect GitHub
5. Deploy

---

## 📦 Environment Variables Needed

**Find in Supabase Dashboard**:

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: Settings → API
4. Copy these values:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Add to Your Platform**:

**Vercel**: Settings → Environment Variables
**Netlify**: Site settings → Build & deploy → Environment
**Supabase**: Environment variable in dashboard

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (builds successfully)
- [ ] Run `npm run preview` (looks good locally)
- [ ] Applied all database migrations
- [ ] Environment variables configured
- [ ] Tested admin login (ADMIN001 / admin123)
- [ ] Tested student login
- [ ] Tested bulk upload
- [ ] Tested all tabs (Students, Courses, Grades)
- [ ] HTTPS enabled on custom domain
- [ ] Domain configured (if using custom)
- [ ] Backups configured in Supabase
- [ ] Admin password changed from default

---

## 🔧 Supabase Migrations

**Must apply before deploying:**

```bash
# Using Supabase CLI
supabase link --project-ref your-project-id
supabase migration up
```

Or manually via Supabase dashboard:
1. Go to SQL Editor
2. Run each migration file in order:
   - `20251116212809_*.sql`
   - `20251116213226_*.sql`
   - `20251117104711_*.sql`
   - `20251117110000_*.sql`
   - `20251117160000_*.sql` (password hashing)
   - `20251117170000_*.sql` (security policies)

---

## 🌐 Custom Domain Setup

### **Vercel**
1. Settings → Domains
2. Add custom domain
3. Update DNS records (follow instructions)

### **Netlify**
1. Domain settings
2. Add custom domain
3. Update DNS records

### **Both**: Enable HTTPS
- Automatic with Let's Encrypt
- Takes ~24 hours to activate

---

## 🔐 Post-Deployment Security

After deploying:

1. **Change Admin Password**
   - Default: `ADMIN001` / `admin123`
   - Create strong unique password
   - Update in database

2. **Configure CORS** (Supabase)
   - Dashboard → Settings → API
   - Add your domain to CORS

3. **Set up Backups** (Supabase)
   - Database → Backups
   - Enable daily backups

4. **Monitor Logs**
   - Check error monitoring
   - Review audit_logs table
   - Monitor failed logins

---

## 📊 Monitor After Deployment

### **Check Health**
```bash
# Test your deployed app
curl https://your-domain.com

# Should return HTML
```

### **View Logs**
- **Vercel**: Deployments → Logs
- **Netlify**: Deploys → Logs
- **Supabase**: Logs → Edge Functions

### **Check Database**
- Go to Supabase dashboard
- View audit_logs for activity
- Check migrations are applied

---

## 🆘 Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment variables not working
- Verify exact variable names (case-sensitive!)
- Redeploy after adding variables
- Check platform dashboard

### Database migrations not applied
- Go to Supabase SQL Editor
- Run migrations manually
- Verify all migrations completed

### Login not working
- Check Supabase credentials
- Verify admin table has ADMIN001 record
- Check RLS policies enabled

---

## 📈 Performance Tips

After deploying:

1. Enable caching
   - Vercel/Netlify: Automatic
   - Custom server: Configure headers

2. Use CDN
   - Vercel/Netlify: Included
   - Custom: Use Cloudflare

3. Monitor performance
   - Check deployment metrics
   - Review build time trends

---

## 🎯 Next Steps

1. **Deploy to staging first**
   - Test in production-like environment
   - Verify all features work
   - Check performance

2. **Monitor closely first week**
   - Watch for errors
   - Check database logs
   - Monitor login attempts

3. **Plan updates**
   - Regular security updates
   - Feature additions
   - Performance improvements

---

## 📞 Support URLs

- Vercel: https://vercel.com/support
- Netlify: https://support.netlify.com
- Supabase: https://supabase.com/support

---

## 🎉 Deployment Complete!

Your Grade Guardian app is now live on the internet! 🚀

**Share your deployment URL:**
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`
- Custom: `https://yourdomain.com`

**Test with:**
- Admin: `ADMIN001` / `admin123`
- Student: Any student code (STU001, STU002, etc.)
