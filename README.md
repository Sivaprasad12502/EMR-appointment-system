# EMR Appointment System

A comprehensive Electronic Medical Records (EMR) Appointment Management System built with the MERN stack. This system enables healthcare facilities to efficiently manage doctor schedules, patient appointments, and user roles.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [User Roles & Permissions](#user-roles--permissions)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Usage Guide](#usage-guide)
- [Default Credentials](#default-credentials)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Core Features
- **User Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (RBAC)
  - Secure password hashing with bcrypt

- **Multi-Role Support**
  - Super Admin: Full system access and user management
  - Doctor: Schedule management and appointment viewing
  - Receptionist: Patient registration and appointment booking
  - Patient: Self-registration and appointment booking

- **Appointment Management**
  - Real-time slot availability checking
  - Automated slot generation based on doctor schedules
  - Appointment status tracking (scheduled, arrived, completed, cancelled)
  - Conflict prevention (no double-booking)
  - Break time management

- **Doctor Schedule Management**
  - Flexible working hours configuration
  - Multiple working days selection
  - Break time slots
  - Customizable appointment duration (15, 20, 30, 45, 60 minutes)

- **Patient Management**
  - Patient profile creation and management
  - Auto-generated unique patient IDs
  - Patient search functionality
  - Appointment history tracking

- **Dashboard & Statistics**
  - Real-time appointment statistics
  - Role-specific dashboard views
  - Quick access to key metrics

- **Audit Logging**
  - System activity tracking
  - User action logging
  - Entity change history

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js v5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose v9** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Validator** - Data validation

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router v7** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Icons** - Icon library

## 📁 Project Structure

```
EMRappoimentSystem/
├── Backend/
│   ├── confiq/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── appointementConroller.js
│   │   ├── authControlles.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── autMiddleware.js      # JWT authentication
│   │   ├── roleMiddleware.js     # Role-based access control
│   │   └── errorHandler.js       # Global error handling
│   ├── models/
│   │   ├── User.js               # User model
│   │   ├── Doctor.js             # Doctor profile model
│   │   ├── Patient.js            # Patient model
│   │   ├── Appointment.js        # Appointment model
│   │   └── AuditLog.js          # Audit logging model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── doctorRoute.js
│   │   ├── patientRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── auditLogger.js        # Audit logging utility
│   │   ├── generateSlots.js      # Slot generation logic
│   │   ├── generateToken.js      # JWT token generation
│   │   └── validator.js          # Data validation helpers
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server setup
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── api/                  # API integration layer
    │   │   ├── appointmentApi.js
    │   │   ├── authApi.js
    │   │   ├── axiosClient.js
    │   │   ├── doctorApi.js
    │   │   ├── patientApi.js
    │   │   └── usersApi.js
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.jsx    # Main layout wrapper
    │   │   ├── protectedRoute/
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── ui/               # Reusable UI components
    │   │       ├── Button.jsx
    │   │       ├── Card.jsx
    │   │       ├── Input.jsx
    │   │       ├── Loader.jsx
    │   │       ├── Modal.jsx
    │   │       └── Select.jsx
    │   ├── context/
    │   │   └── UseContex.jsx     # Global state management
    │   ├── hooks/
    │   │   ├── useAuth.js        # Authentication hooks
    │   │   ├── UseForm.js        # Form handling
    │   │   └── useUser.js        # User data hooks
    │   ├── pages/
    │   │   ├── admin/            # Admin management
    │   │   ├── appointments/     # Appointment pages
    │   │   ├── dashboard/        # Dashboard
    │   │   ├── doctors/          # Doctor pages
    │   │   ├── login/            # Login page
    │   │   ├── patients/         # Patient management
    │   │   └── register/         # Registration page
    │   ├── App.jsx               # Route configuration
    │   └── main.jsx              # Application entry
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (optional, for cloning)

## 🚀 Installation

### 1. Clone the Repository (or download the ZIP)

```bash
git clone <repository-url>
cd EMRappoimentSystem
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section below)
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../Frontend

# Install dependencies
npm install
```

## 🔧 Environment Variables

### Backend (.env)

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/emr_appointment_system
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secrets (Use strong random strings in production)
JWT_ACCESS_SECRET=your-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-secret-refresh-key-change-this-in-production

# Super Admin Credentials (First-time setup)
SUPER_ADMIN_NAME=admin@hospital
SUPER_ADMIN_EMAIL=admin@hospital.com
SUPER_ADMIN_PASSWORD=Admin@123
```

### Frontend (if needed)

Create a `.env` file in the `Frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**⚠️ Security Note:** Never commit `.env` files to version control. The values above are examples only. Use strong, unique values in production.

## ▶️ Running the Application

### Development Mode

#### Start Backend Server

```bash
cd Backend
npm run dev
# Server will start on http://localhost:5000
```

#### Start Frontend Development Server

```bash
cd Frontend
npm run dev
# Frontend will start on http://localhost:5173
```

### Production Mode

#### Backend

```bash
cd Backend
npm start
```

#### Frontend

```bash
cd Frontend
npm run build
npm run preview
```

## 👥 User Roles & Permissions

### Super Admin
- **Full system access**
- Create and manage doctors, receptionists
- View all appointments and statistics
- Access to admin panel
- Audit log access

### Doctor
- View and manage own schedule
- View own appointments
- Mark patients as arrived
- Update appointment status
- Cannot book or cancel appointments

### Receptionist
- Register new patients
- Book appointments for patients
- View all appointments
- Cancel and reschedule appointments
- View patient information
- Cannot manage doctors or schedules

### Patient
- Self-registration
- Book own appointments
- View own appointments
- View available doctors
- Cannot access other patients' data

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register Patient
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Appointment Endpoints

#### Get All Appointments
```http
GET /api/appointments
Authorization: Bearer <access_token>
Query Parameters:
  - status: scheduled|arrived|completed|cancelled
  - date: YYYY-MM-DD
  - doctor: doctor_id
  - patient: patient_id
```

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "doctorId": "doctor_id",
  "date": "2026-03-15",
  "slot": "09:00",
  "purpose": "Regular checkup",
  "patientId": "patient_id" // Optional for receptionists
}
```

#### Get Appointment Statistics
```http
GET /api/appointments/stats
Authorization: Bearer <access_token>
Roles: super_admin, doctor, receptionist
```

#### Update Appointment
```http
PUT /api/appointments/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Patient examined"
}
```

#### Mark Patient as Arrived
```http
POST /api/appointments/:id/arrive
Authorization: Bearer <access_token>
Roles: receptionist, doctor
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <access_token>
Roles: super_admin, receptionist
```

### Doctor Endpoints

#### Get All Doctors
```http
GET /api/doctors
Authorization: Bearer <access_token>
Query Parameters:
  - department: string
  - isActive: true|false
  - search: string
```

#### Get Doctor Schedule
```http
GET /api/doctors/:id/schedule
Authorization: Bearer <access_token>
```

#### Update Doctor Schedule
```http
PUT /api/doctors/:id/schedule
Authorization: Bearer <access_token>
Roles: super_admin, doctor (own schedule)
Content-Type: application/json

{
  "startTime": "09:00",
  "endTime": "17:00",
  "breakStart": "13:00",
  "breakEnd": "14:00",
  "slotDuration": 30,
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

#### Get Available Slots
```http
GET /api/doctors/:id/slots?date=2026-03-15
Authorization: Bearer <access_token>
```

#### Get Departments
```http
GET /api/doctors/departments
Authorization: Bearer <access_token>
```

### User Management Endpoints

#### Create User (Doctor/Receptionist)
```http
POST /api/users
Authorization: Bearer <access_token>
Roles: super_admin
Content-Type: application/json

{
  "name": "Dr. Sarah Smith",
  "email": "sarah@hospital.com",
  "password": "password123",
  "role": "doctor",
  "department": "Cardiology",
  "specialization": "Heart Diseases",
  "qualification": "MD, MBBS",
  "experience": 10
}
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer <access_token>
Roles: super_admin
Query Parameters:
  - role: doctor|receptionist
  - search: string
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <access_token>
Roles: super_admin
```

#### Deactivate User
```http
DELETE /api/users/:id
Authorization: Bearer <access_token>
Roles: super_admin
```

### Patient Endpoints

#### Search Patients
```http
GET /api/patients?search=john
Authorization: Bearer <access_token>
Roles: super_admin, doctor, receptionist
```

#### Get Patient Details
```http
GET /api/patients/:id
Authorization: Bearer <access_token>
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String (required, 2-100 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed, min 6 chars),
  role: Enum ["super_admin", "doctor", "receptionist", "patient"],
  isActive: Boolean (default: true),
  lastLogin: Date,
  timestamps: true
}
```

### Doctor Model
```javascript
{
  user: ObjectId (ref: User, required, unique),
  department: String (required),
  specialization: String,
  qualification: String,
  experience: Number,
  schedule: [{
    day: Enum ["monday", "tuesday", ..., "sunday"],
    start: String (HH:MM format),
    end: String (HH:MM format),
    breaks: [{
      start: String (HH:MM),
      end: String (HH:MM)
    }]
  }],
  slotDuration: Number (5-120 minutes, default: 15),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Patient Model
```javascript
{
  user: ObjectId (ref: User),
  patientId: String (auto-generated, unique),
  name: String (required),
  phone: String (unique),
  email: String,
  dateOfBirth: Date,
  gender: Enum ["male", "female", "other"],
  address: String,
  medicalHistory: String,
  allergies: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Appointment Model
```javascript
{
  doctor: ObjectId (ref: Doctor, required),
  patient: ObjectId (ref: Patient, required),
  date: String (YYYY-MM-DD format, required),
  slot: String (HH:MM format, required),
  status: Enum ["scheduled", "arrived", "completed", "cancelled"],
  purpose: String (max 500 chars),
  notes: String (max 1000 chars),
  arrivedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true,
  // Unique constraint on (doctor, date, slot) for non-cancelled appointments
}
```

## 📖 Usage Guide

### First-Time Setup

1. **Start the Backend and Frontend servers**
   
2. **Login as Super Admin** (automatically created on first run)
   - Email: `admin@hospital.com`
   - Password: `Admin@123`

3. **Create Doctors**
   - Navigate to Admin panel
   - Click "Add Doctor"
   - Fill in doctor details (name, email, password, department, etc.)

4. **Set Doctor Schedules**
   - Login as the doctor
   - Navigate to "Schedule" page
   - Set working hours (start time, end time)
   - Select working days
   - Set break times (optional)
   - Choose appointment slot duration
   - Save schedule

5. **Create Receptionist** (optional)
   - Login as Super Admin
   - Navigate to Admin panel
   - Click "Add Receptionist"
   - Fill in receptionist details

### Patient Self-Registration

1. Navigate to the registration page
2. Fill in patient details
3. Submit registration
4. Login with registered credentials

### Booking an Appointment

#### As a Patient:
1. Login as patient
2. Navigate to "Appointments" → "Book New Appointment"
3. Select doctor and date
4. Choose available time slot
5. Add reason for visit (optional)
6. Confirm booking

#### As a Receptionist:
1. Login as receptionist
2. Navigate to "Appointments" → "Book New Appointment"
3. Search for existing patient or register new patient
4. Select doctor and date
5. Choose available time slot
6. Add reason for visit
7. Confirm booking

### Managing Appointments

#### View Appointments
- All roles can view appointments (filtered by role permissions)
- Filter by status, date, doctor, or patient
- View appointment details

#### Update Appointment Status
- Doctors and Receptionists can mark patients as "arrived"
- Doctors can mark appointments as "completed"
- Receptionists and Super Admin can cancel appointments

## 🔑 Default Credentials

### Super Admin
```
Email: admin@hospital.com
Password: Admin@123
```

**⚠️ Important:** Change these credentials immediately after first login in production!

### Creating Test Users

Use the Admin panel (logged in as Super Admin) to create:
- **Doctors**: Provide name, email, password, department, etc.
- **Receptionists**: Provide name, email, password, role selection

Patients can self-register through the registration page.

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- **Check MongoDB connection**: Ensure MongoDB is running and connection string is correct
- **Port already in use**: Change PORT in `.env` or kill process using port 5000
- **Missing dependencies**: Run `npm install` in Backend directory

#### Frontend won't start
- **Port conflict**: Frontend runs on port 5173 by default
- **API connection issues**: Verify `VITE_API_BASE_URL` in Frontend `.env`
- **Dependencies missing**: Run `npm install` in Frontend directory

#### Authentication errors
- **"Invalid token"**: Token may be expired, try logging in again
- **"Not authorized"**: Check if token is being sent in Authorization header
- **CORS errors**: Verify CORS configuration in Backend server.js

#### Appointment booking fails
- **"Doctor not available"**: Ensure doctor has set up their schedule
- **"Slot already booked"**: Choose a different time slot
- **"Invalid date"**: Ensure date is not in the past

#### Slots not showing
- **Doctor schedule not set**: Doctor must configure schedule first
- **Check console logs**: Backend logs show slot generation details
- **Date/time issues**: Verify schedule times (start time must be before end time)

### Debug Tips

1. **Check Backend logs**: Terminal running `npm run dev` in Backend directory
2. **Check Browser console**: Press F12 in browser for frontend errors
3. **Verify API responses**: Use browser DevTools Network tab
4. **Database check**: Use MongoDB Compass or CLI to verify data

### Getting Help

If you encounter issues:
1. Check the error message carefully
2. Review the relevant section in this README
3. Check backend terminal output
4. Verify environment variables
5. Ensure all dependencies are installed

## 🔐 Security Considerations

- **Passwords**: All passwords are hashed using bcrypt before storage
- **JWT Tokens**: Access tokens expire in 15 minutes; refresh tokens in 7 days
- **Environment Variables**: Never commit `.env` files to version control
- **CORS**: Configure allowed origins appropriately for production
- **Input Validation**: All inputs are validated before processing
- **SQL Injection**: Using MongoDB with Mongoose provides protection
- **XSS Protection**: React escapes values by default

## 🚀 Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use strong, random JWT secrets
3. Configure MongoDB Atlas for cloud database
4. Set up proper CORS origins
5. Enable HTTPS
6. Consider using PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name emr-api
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to hosting service (Vercel, Netlify, etc.)
3. Configure environment variables on hosting platform
4. Update API base URL to production backend URL






