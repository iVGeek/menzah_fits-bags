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

Default admin password: `menzah-admin-2024` (change in production!)

## 🎨 Design Features

- **Material Design 3** - Google's latest design system
- **Coastal Color Palette** - Ocean blues, coral accents, sand tones
- **Crochet Animations** - Yarn loop, stitch pull, chain stitch effects
- **SVG Graphics** - Scalable decorative elements
- **CSS Variables** - Easy theming and customization

## 🌐 Deployment

### Render.com

1. Connect your GitHub repository
2. Use the `render.yaml` configuration file
3. Set environment variables:
   - `PORT` (auto-set by Render)
   - `ADMIN_TOKEN` (secure password)

### Railway

1. Connect your GitHub repository
2. Railway will auto-detect the Node.js project
3. Set environment variables:
   - `ADMIN_TOKEN` (secure password)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
ADMIN_TOKEN=your-secure-admin-password
NODE_ENV=production
```

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
