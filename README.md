# MedConnect – Full-Stack Doctor Appointment Booking Platform

MedConnect is a production-ready, full-stack telemedicine and appointment scheduling platform similar to Practo, Apollo 24/7, and MediBuddy. Built with the **MERN** stack, it features secure JWT authentication, multi-role user dashboards (Patient, Doctor, Admin), slot management (double-booking prevention), lab report document sharing, real-time alerting (WebSockets), and platform-wide analytics charts.

---

## 🌟 Key Features

1. **User Authentication System**: JWT token session cookies, secure bcrypt password hashing, forgot/reset password email links, and role-based route guard shields.
2. **Doctor Discovery Engine**: Advanced sidebar filters (experience years, fees, rating thresholds, specializations, locations) and sorting (highest rated, lowest fees, most reviews).
3. **Double-Booking Prevention**: Available day-by-day scheduler grids. Busy slots are automatically disabled based on prior bookings.
4. **Dashboard Panels**:
   - **Patient**: Profile editors, appointment lists, medical report uploaders (PDF/images), and notification logs.
   - **Doctor**: Appointment request managers, availability slot planners, earnings stats (Chart.js), and reviews logs.
   - **Admin**: Approved/unapproved doctor tables, user directories, global analytics graphs (Consultations, Registrations, specializations doughnut charts).
5. **Real-Time Websockets**: In-app popups and database updates powered by Socket.io when appointments are approved, confirmed, or rescheduled.
6. **Robust Files Buffer**: Multer buffer uploader configured to upload directly to Cloudinary with local storage path fallbacks.

---

## 📂 Project Structure

```text
DoctorAppoint/
├── backend/
│   ├── config/             # DB & Cloudinary configurations
│   ├── controllers/        # REST route controller handlers
│   ├── middleware/         # JWT, Role authorization, Multer uploads
│   ├── models/             # Mongoose MongoDB schemas
│   ├── routes/             # Express routing blueprints
│   ├── services/           # Nodemailer email services
│   ├── uploads/            # Temporary local files backup folder
│   ├── .env                # Secret configurations
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express + Socket.io bootstrap entry
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, Timeline, Skeletons
│   │   ├── pages/          # Home, Details, Dashboards, Auth
│   │   ├── redux/          # Store and Slices (Auth, Doctors, Bookings)
│   │   ├── services/       # Pre-configured Axios instance
│   │   ├── index.css       # Tailwind classes & Glassmorphism styles
│   │   ├── main.jsx        # Redux Provider wrapper
│   │   └── App.jsx         # App router maps & Websockets listener
│   ├── index.html          # Document head SEO metadata
│   ├── tailwind.config.js  # Theme branding tokens
│   ├── postcss.config.js   # Styles processing configurations
│   └── package.json        # Frontend dependencies
│
└── README.md               # Setup & deployment manual (This file)
```

---

## 🛠️ Installation Guide (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.

---

### Step 1: Clone & Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file in the `backend/` folder and insert your variables:
   ```ini
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/medconnect
   JWT_SECRET=medconnect_super_secret_jwt_key_987654321
   
   # Optional (Required for cloud file uploads)
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   
   # Optional (Required for verification & reset emails)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```
   > [!NOTE]
   > If Cloudinary variables are empty, MedConnect will automatically save medical reports locally under the `backend/uploads/` directory, serving files as static items. If Email parameters are left empty, the server will print validation links to the terminal console for testing.
   
3. Run the development server:
   ```bash
   npm run dev
   ```

---

### Step 2: Configure & Launch Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & User Guide

### 🧑‍⚕️ 1. Doctor Profile & Approval Flow
1. Go to the Sign Up screen (`/register`) and choose **Join as Doctor**.
2. Complete the qualifications, fees, specialization, and address fields.
3. Upon registration, the doctor profile status will be **Pending Verification** (hidden from public discovery).
4. Register a second account as **Patient** or log in to the **Admin** dashboard. 
5. To test Admin actions, register an account with a test email and manually set the `role` to `Admin` in the MongoDB `users` collection.
6. Under the Admin Console, choose the **Doctor Approvals** tab and select **Approve & Live** for the doctor. The doctor will receive a real-time WebSocket toast notification of the approval.

### 📅 2. Slot Availability & Booking
1. Log in as the approved **Doctor** and navigate to the **Schedule Weekly Slots** tab.
2. Select a day (e.g., Monday) and add time slots (e.g., `09:00 AM`, `10:00 AM`). Save the availability schedule.
3. Log in as a **Patient**, search for the doctor, and click **Book Now**.
4. Select the scheduled date and time slot. Enter the symptom reasons and submit.
5. If you select the same slot again, the system will mark it as **Booked** (disabled), preventing double booking.
6. The Doctor will receive a real-time requested consultation card, which they can **Approve**, **Lock Slot** (Confirm), and mark as **Completed**.

---

## 🚀 Deployment Guide

### MongoDB Configuration
For production, swap out the local MongoDB connection string for an Atlas URI:
```ini
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/medconnect?retryWrites=true&w=majority
```

### Backend Deployment (e.g., Render, Heroku)
1. Add a start script in `package.json` pointing to `node server.js` (already included).
2. Configure environment variables in the host platform dashboard.
3. Enable CORS for your production frontend domain inside `backend/server.js`.

### Frontend Deployment (e.g., Vercel, Netlify)
1. Configure build command: `npm run build`.
2. Configure output directory: `dist`.
3. Set up redirects for single-page routing (e.g., a `_redirects` file for Netlify containing `/* /index.html 200`).
