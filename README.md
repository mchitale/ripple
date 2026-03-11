# 🌊 Ripple

A warm, shared daily check-in journal for small groups of friends.
Log mood, energy, sleep, gym, shower, water, and a daily wildcard — then watch patterns emerge together.

---

## Getting it live (30 minutes, free)

### Step 1 — Supabase (your database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** → give it a name (e.g. `ripple`) → set a database password → choose a region close to you
3. Wait ~2 minutes for it to provision
4. In the left sidebar go to **SQL Editor** → click **New query**
5. Paste the entire contents of `supabase_schema.sql` into the editor and click **Run**
6. You should see "Success. No rows returned."

Now grab your credentials:
- Go to **Settings → API**
- Copy your **Project URL** (looks like `https://xxxx.supabase.co`)
- Copy your **anon public** key (long string starting with `eyJ...`)
https://ggzhsirxamlsxdvwptiz.supabase.co
anon_public eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnemhzaXJ4YW1sc3hkdndwdGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxOTg5NTUsImV4cCI6MjA4ODc3NDk1NX0.3RheGop8QIb5KAGkNXCxtWVe4vyU-rPNEL10s2gtm58
---

### Step 2 — Local setup

```bash
# Clone or download this project, then:
cd ripple
npm install

# Copy the env template
cp .env.example .env.local

# Open .env.local and fill in your two Supabase values:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
```

Test it locally:
```bash
npm run dev
# Opens at http://localhost:5173
```

---

### Step 3 — Deploy to Netlify

1. Push your code to a **GitHub repository** (make sure `.env.local` is in `.gitignore` — it already is)
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Connect GitHub and select your repo
4. Build settings (should auto-detect):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Before deploying, go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
6. Click **Deploy site** — it'll be live in ~2 minutes
7. Netlify gives you a URL like `https://ripple-abc123.netlify.app`

https://fabulous-snickerdoodle-6abf6d.netlify.app/

Optional: in Netlify **Domain settings** you can set a custom subdomain like `ripple-yourname.netlify.app` for free.

---

### Step 4 — Share with your group

Send your friends the app URL plus these instructions:
> "Go to [your URL], click **Join a group**, enter your name, the invite code **XXXX**, and the group password."

The invite code and password are shown after you create a group. You can also find the invite code in the app header menu (⋮).

---

## How it works

| Feature | Details |
|---|---|
| **Auth** | No email needed — group password + invite code. Session stored in localStorage. |
| **Check-ins** | Twice daily (morning + evening). Upserts so re-submitting just overwrites. |
| **Feed** | Real-time — entries appear live as your friends log. |
| **Insights** | Client-side correlation engine. Patterns appear after ~4 days of data. |
| **Wildcard** | 30 rotating questions, one per day. Cycles annually. |
| **Security** | Supabase Row Level Security ensures data is scoped. Password is SHA-256 hashed client-side before storage. |

---

## Project structure

```
ripple/
├── src/
│   ├── lib/
│   │   ├── supabase.js     ← Supabase client
│   │   ├── auth.jsx        ← Session context (localStorage)
│   │   ├── db.js           ← All database calls
│   │   ├── insights.js     ← Correlation engine
│   │   ├── wildcards.js    ← 30 daily questions
│   │   └── utils.js        ← Helpers (hashing, formatting, etc.)
│   ├── components/
│   │   └── UI.jsx          ← Reusable primitives (Button, Card, Input…)
│   ├── pages/
│   │   ├── Landing.jsx     ← Home screen
│   │   ├── Auth.jsx        ← Join + Create group
│   │   ├── AppShell.jsx    ← Header + bottom nav
│   │   ├── Checkin.jsx     ← Daily logging form
│   │   ├── Feed.jsx        ← Group feed (real-time)
│   │   └── Insights.jsx    ← Correlations + charts
│   ├── App.jsx             ← Router + auth guard
│   └── main.jsx            ← Entry point
├── supabase_schema.sql     ← Paste into Supabase SQL editor
├── netlify.toml            ← SPA redirect config
├── .env.example            ← Copy to .env.local
└── package.json
```

---

## Costs

| Service | Free tier | Your usage |
|---|---|---|
| Supabase | 500MB DB, 50k MAU | ~10MB, 10–20 users ✓ |
| Netlify | 100GB bandwidth/mo | Negligible ✓ |
| **Total** | | **£0/month** |

---

## Potential future additions

- Push notifications / email nudges for evening check-in
- Weekly summary digest email
- Historical calendar view (see any past day)
- Custom variables per group
- Export data as CSV
