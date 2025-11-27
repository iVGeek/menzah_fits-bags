# Menzah_fits | Handcrafted Coastal Crochet Fashion

A premium showcase website for handcrafted crochet dresses and outfits from the Kenyan coast, featuring a backend API for stock management.

## 🌊 Features

- **Express.js Backend** - RESTful API for stock and product management
- **Admin Panel** - Material Design 3 inspired dashboard for inventory management
- **Responsive Design** - Works beautifully on all devices
- **Crochet-Inspired Animations** - Yarn loops, stitch patterns, and weave effects
- **Material Design 3 Theme** - Modern UI with Google's design system
- **Interactive Collections Gallery** - Filter by category with smooth transitions
- **Testimonials Carousel** - Auto-rotating customer reviews
- **Contact Form** - Simple form with submission simulation
- **Accessibility** - Focus states and semantic HTML

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3000`

### Local Development

```bash
# Start with nodemon for auto-reload (if installed)
npm run dev
```

### Static Mode (without backend)

For static hosting without the backend:

```bash
# Using Python
python -m http.server 8000

# Using npx serve
npx serve
```

## 📁 Project Structure

```
menzah_fits-bags/
├── index.html          # Main HTML file with all sections
├── styles.css          # Complete CSS styles with Material Design
├── main.js             # Frontend JavaScript with API integration
├── package.json        # Node.js dependencies
├── server/
│   └── index.js        # Express.js backend server
├── admin/
│   └── index.html      # Admin panel for stock management
├── public/             # Static assets (favicon, images)
├── render.yaml         # Render.com deployment config
├── railway.json        # Railway deployment config
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🔐 Admin Panel

Access the admin panel at `/admin` to manage:

- **Products** - Add, edit, delete collections
- **Stock** - Update inventory by color/design
- **Dashboard** - View inventory summary and low stock alerts

### Default Login Credentials

| Role | Username | Default Password | Permissions |
|------|----------|------------------|-------------|
| Dev Superior | `devsuperior` | `dev@menzah2024` | Full access, user management |
| Admin | `admin` | `admin` | Product & stock management |

> ⚠️ **Change default passwords in production** via environment variables (`ADMIN_PASSWORD`, `DEV_PASSWORD`)

## 🎨 Design Features

- **Material Design 3** - Google's latest design system
- **Coastal Color Palette** - Ocean blues, coral accents, sand tones
- **Crochet Animations** - Yarn loop, stitch pull, chain stitch effects
- **SVG Graphics** - Scalable decorative elements
- **CSS Variables** - Easy theming and customization

## 🌐 Deployment

### Understanding the Architecture

This is a **full-stack monolithic application** where the Express.js backend serves both:
- **Frontend** - The main website (index.html, styles.css, main.js)
- **Admin Panel** - The inventory management dashboard (/admin)
- **API** - RESTful endpoints for data management (/api)

**You only need to deploy ONE service** - the backend handles everything!

### Render.com (Recommended)

#### Step-by-Step Deployment

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up

2. **Connect Your Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the `menzah_fits-bags` repository

3. **Configure the Service** (or use render.yaml)
   - **Name**: `menzah-fits` (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (for testing) or Starter (for production)

4. **Set Environment Variables**
   Go to your service settings → Environment → Add the following:
   
   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Auto-set by Render, but can specify |
   | `ADMIN_PASSWORD` | `your-secure-password` | Change default admin password |
   | `DEV_PASSWORD` | `your-dev-password` | Change default dev_superior password |
   | `TOKEN_SECRET` | `your-random-secret-key` | Secret for JWT-like token signing |

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

#### Accessing Your Application on Render

Once deployed, your app will be available at: `https://your-service-name.onrender.com`

| URL | Description |
|-----|-------------|
| `https://your-service-name.onrender.com` | Main website (frontend) |
| `https://your-service-name.onrender.com/admin` | Admin panel login |
| `https://your-service-name.onrender.com/api/collections` | API endpoint |

#### Admin Panel Access on Render

1. Navigate to `https://your-service-name.onrender.com/admin`
2. Login with your credentials:
   - **Default Admin**: Username: `admin`, Password: `admin` (change via env var!)
   - **Dev Superior**: Username: `devsuperior`, Password: `dev@menzah2024` (change via env var!)

> ⚠️ **Security Warning**: Always set custom passwords via environment variables in production!

### Railway

1. Connect your GitHub repository
2. Railway will auto-detect the Node.js project
3. Set environment variables:
   - `ADMIN_PASSWORD` (secure password for admin user)
   - `DEV_PASSWORD` (secure password for dev_superior user)
   - `TOKEN_SECRET` (random secret for token signing)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Authentication (IMPORTANT: Change these in production!)
ADMIN_PASSWORD=your-secure-admin-password
DEV_PASSWORD=your-secure-dev-password
TOKEN_SECRET=your-random-secret-key-for-token-signing
```

### Production Security Checklist

Before deploying to production, ensure you:

- [ ] Set strong, unique passwords for `ADMIN_PASSWORD` and `DEV_PASSWORD`
- [ ] Set a random `TOKEN_SECRET` (use `openssl rand -hex 32` to generate)
- [ ] Keep environment variables secure and never commit them to git
- [ ] Consider adding a database for persistent data storage (current setup uses in-memory storage)

## 📡 API Endpoints

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/collections` | Get all collections |
| GET | `/api/collections?category=dresses` | Filter by category |
| GET | `/api/collections/:id` | Get single collection |

### Admin API (requires auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/collections` | Get collections with stock |
| POST | `/api/admin/collections` | Create collection |
| PUT | `/api/admin/collections/:id` | Update collection |
| DELETE | `/api/admin/collections/:id` | Delete collection |
| PATCH | `/api/admin/collections/:id/stock` | Update stock |
| GET | `/api/admin/inventory` | Get inventory summary |

## 📱 Sections

1. **Hero** - Animated brand introduction with crochet patterns
2. **About** - Brand story with visual showcase
3. **Collections** - Filterable product gallery
4. **Testimonials** - Customer reviews carousel
5. **Contact** - Contact form and social links
6. **Footer** - Quick links and brand info

## 🧶 About Menzah_fits

Premium handcrafted crochet dresses and outfits inspired by the beauty of Kenya's coast. Each piece is a unique work of art, woven with passion and authenticity.

---

Crafted with ❤️ on the Kenyan Coast
