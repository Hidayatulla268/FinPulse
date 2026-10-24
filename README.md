# Finpulse 🇮🇳
### Real-Time Daily Budgeting, Burn Pace & Live Banking for India

<p align="center">
  <img src="public/thumbnail.jpg" alt="Finpulse Project Thumbnail" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" />
</p>

Finpulse is a personal finance application tailored specifically for the Indian market. It converts monthly salary (e.g. ₹1,00,000) into a realistic daily spending allowance (₹3,333/day), tracks live UPI expenses, auto-detects Zepto and Blinkit impulse leaks, and sends an automated 9 PM nightly financial report.

---

## 🌟 Key Features

### 1. 🪙 Real-Time Daily Budget Calculator
- **Formula**: `Daily Allowance = Monthly In-Hand Salary / 30 Days` (e.g., ₹1,00,000 / 30 = **₹3,333/day**).
- **Discretionary Mode**: Option to deduct fixed monthly commitments (Rent, EMIs, SIPs, Cook/Maid, WiFi) before dividing by 30.
- **Live Running Counter**: Deducts expenses throughout the day in real time.
- **Hourly Burn Pace**: Calculates remaining budget per hour for the remaining hours in the day.

### 2. ⚡ Auto Expense Tracking & Categorization
- **CSV Bank Statement Parser**: Auto-parses exported statements from **HDFC Bank**, **ICICI Bank**, **SBI**, **Axis Bank**, and **Google Pay / Paytm / PhonePe**.
- **Instant Auto-Categorization**:
  - 🍔 **Food & Dining**: Swiggy, Zomato, Starbucks, Chai Point, EatClub
  - ⚡ **Quick Commerce & Groceries**: Blinkit, Zepto, Swiggy Instamart, BigBasket
  - 🛍️ **Shopping & E-Commerce**: Amazon India, Flipkart, Myntra, Ajio, Nykaa
  - 🚗 **Travel & Commute**: Uber, Ola, Rapido, Namma Yatri, Metro, Fuel
  - 🍿 **Subscriptions & OTT**: Netflix, Spotify, Prime Video, Hotstar, YouTube
  - 💸 **Random UPI & Tapri**: Chai tapris, Paan shops, Kirana stores, Friend splits
  - 📱 **Bills & Utilities**: Jio, Airtel, Electricity, WiFi
  - 🏥 **Health & Pharmacy**: Apollo 247, 1mg, Cult.fit
- **1-Tap Presets**: Quick buttons for ₹20 Chai Tapri, ₹180 Namma Yatri, ₹340 Zepto Munchies, ₹480 Swiggy Meal, ₹385 Starbucks Coffee, etc.

### 3. 🌙 9 PM Nightly Financial Report
- Automated evening summary popup and push notification.
- **Exact Formatted Verdict**:
  > *"Your daily budget was ₹3,333. You spent ₹4,200. Overspent by ₹867."* (or *"Saved ₹1,120!"*)
- Category breakdown with percentages and ₹ amounts.
- Top 3 spending merchants of the day.
- **WhatsApp Share API**: 1-click to share report via WhatsApp format (`https://api.whatsapp.com/send?text=...`).
- **Relatable Indian Roasts & Praises**:
  - *“Working to fund my own bad decisions”*
  - *“Zepto delivered in 8 minutes, your financial regret will last till salary day.”*
  - *“Your local chai tapri UPI is quietly building generational wealth for bhaiya.”*

### 4. 🛒 Merchant Insights & "The 10-Minute Delivery Tax"
- Highlights repetitive money-drainers: **Zepto, Blinkit, Swiggy, Zomato, Amazon, Myntra**.
- Quantifies delivery charges, handling fees, and surge pricing leak (~₹39/order).
- Flags impulsive orders placed between **10:30 PM and 4:30 AM**.

### 5. 🍿 Subscription Tracker
- Auto-detects monthly recurring debits: **Netflix (₹649)**, **Spotify (₹119)**, **YouTube Premium (₹149)**, **CultPass (₹1,499)**, **Amazon Prime (₹299)**, **iCloud (₹75)**.
- Computes **Daily Subscription Impact**: *"₹163/day of your daily allowance is locked in before you even wake up!"*
- Direct 1-click cancellation links for each service.

### 6. 🎨 Premium Indian Fintech UI/UX
- Dark mode glassmorphism with emerald and gold accents.
- Indian numbering system formatting (`₹1,00,000` with lakhs & crores).
- Interactive Chart.js visualizations (7-Day Daily Limit Burn Bar Chart + Category Donut Chart).
- Web Audio API synthesizer for clean digital tap chimes and celebration chords without external MP3 files.
- Offline-ready with zero-latency LocalStorage sync.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Dark Glassmorphism
- **Charts**: Chart.js + React-Chartjs-2
- **Icons**: Lucide React
- **Delight**: Canvas-Confetti + Web Audio API synthesizer
- **Persistence**: LocalStorage with automatic hydration + REST API routes

---

## 🚀 Getting Started

1. **Install Dependencies** (already installed in workspace):
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing the MVP Demo
- The app comes pre-loaded with a realistic young techie profile: **Aryan Sharma (₹1,00,000/mo in Bangalore)**.
- Click **"⚡ Quick Add"** to record an expense and watch the daily allowance counter deduct instantly.
- Click **"🌙 9 PM Report"** to inspect today's financial summary and test the WhatsApp share payload.
- Click **"📂 Bank CSV"** and choose **"HDFC Bank CSV"** or **"GPay / UPI CSV"** to test statement importing.
- Click **"⚙️ Settings"** to change monthly income or switch to Net Discretionary mode.
