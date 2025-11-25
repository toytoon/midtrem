# 🔌 Database Connection Pooling Setup

To support **2,000 concurrent users**, you MUST enable Database Connection Pooling in Supabase. This prevents the database from running out of connections during high traffic.

## ✅ Step 1: Enable Pooling in Supabase Dashboard

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Project Settings** > **Database**.
3.  Scroll down to the **Connection Pooling** section.
4.  Ensure **Enable Connection Pooling** is checked.
5.  Set **Pool Mode** to `Transaction`.
    *   *Why Transaction mode?* It is best for serverless environments (like Vercel) where connections are short-lived.
6.  Set **Pool Size** to `15` (or higher if on Pro plan).

## ✅ Step 2: Verify Client Configuration

Your application uses `@supabase/supabase-js` which connects via the **REST API** (HTTPS).
*   **Good News:** The REST API **automatically uses connection pooling** managed by Supabase.
*   **Action:** You do NOT need to change your `SUPABASE_URL` in your `.env` file for the frontend.

## ⚠️ Critical Note for Direct Connections

If you have any **Edge Functions** or **Node.js scripts** (like load testing scripts) that connect directly to the database (not via the API), you MUST use the pooled connection string:

*   **Port:** `6543` (instead of `5432`)
*   **Host:** `aws-0-eu-central-1.pooler.supabase.com` (example)

**Example Connection String:**
```
postgres://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 🚀 Verification

To verify pooling is working:
1.  Run the **Stress Test** (`npm run test:stress` or via k6).
2.  Monitor the **Database Health** in Supabase Dashboard.
3.  Look for "Active Connections". It should stay low (around 10-20) even with 2,000 users.
