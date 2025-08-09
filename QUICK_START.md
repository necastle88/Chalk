# 🚀 Quick Start - Deploy Chalk Fitness App

## Fastest Path to Production (5 minutes)

### 1. Clone & Setup (1 minute)
```bash
git clone <your-repo-url>
cd Chalk
cp .env.example .env
# Edit .env with your actual values
```

### 2. Get Required Keys (2 minutes)

#### Clerk Authentication:
1. Visit [clerk.com](https://clerk.com) → Create account
2. Create new application
3. Copy `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
4. Add to your `.env` file

#### Database (Railway):
1. Visit [railway.app](https://railway.app) → Connect GitHub
2. Deploy PostgreSQL template
3. Copy connection string to `DATABASE_URL` in `.env`

### 3. Deploy Frontend to Vercel (1 minute)
```bash
npm install -g vercel
cd client
vercel --prod
# Follow prompts, set environment variables when asked
```

### 4. Deploy Backend to Railway (1 minute)
```bash
npm install -g @railway/cli
cd ../server
railway login
railway up
# Set environment variables in Railway dashboard
```

### 🎉 You're Live!

Your notification system includes:
- ✅ Toast notifications for workout completions
- ✅ Achievement celebrations for milestones  
- ✅ AI-powered exercise suggestions
- ✅ Safety alerts and form reminders
- ✅ Customizable notification center
- ✅ Mobile-optimized experience

---

## Alternative: One-Click Docker Deploy

```bash
# Ensure Docker is installed
cp .env.example .env
# Edit .env with your values
docker-compose up -d
```

Visit `http://localhost` - your app is running! 🎊

---

## Need Help?

1. **Check logs**: Railway/Vercel dashboards show deployment logs
2. **Common issues**: Review `DEPLOYMENT_GUIDE.md`
3. **Full checklist**: See `PRODUCTION_CHECKLIST.md`

**The notification system is production-ready and will delight your users!** 💪✨
