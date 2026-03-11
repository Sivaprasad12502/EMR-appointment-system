# EMR Appointment System - API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Responses](#error-responses)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Doctors](#doctor-endpoints)
  - [Patients](#patient-endpoints)
  - [Appointments](#appointment-endpoints)
- [Data Models](#data-models)

---

## Overview

The EMR Appointment System API provides endpoints for managing an Electronic Medical Records appointment system. It supports user authentication, patient management, doctor scheduling, and appointment booking.

**Version:** 1.0.0  
**Last Updated:** March 2026

---

## Base URL

```
http://localhost:PORT/api
```

Replace `PORT` with your configured server port (default: check your `.env` file).

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Headers Required

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

The system supports four user roles with different permissions:
- `super_admin` - Full system access
- `doctor` - Can manage their schedule and view appointments
- `receptionist` - Can manage patients and appointments
- `patient` - Can view their own appointments

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## API Endpoints

### Authentication Endpoints

#### 1. Register Patient

Register a new patient user.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient"
    },
    "patient": {
      "_id": "patient_id",
      "patientId": "PAT000001",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

---

#### 2. Login

Authenticate a user and receive a JWT token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "patient"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

---

#### 3. Refresh Token

Get a new access token using a refresh token.

- **URL:** `/api/auth/refresh-token`
- **Method:** `POST`
- **Auth Required:** No

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

---

#### 4. Get Current User

Get the currently authenticated user's information.

- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "patient",
    "isActive": true,
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

---

### User Endpoints

All user endpoints require **super_admin** role.

#### 1. Create User

Create a new user (admin, doctor, receptionist, or patient).

- **URL:** `/api/users`
- **Method:** `POST`
- **Auth Required:** Yes (super_admin)

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane.smith@hospital.com",
  "password": "securepass123",
  "role": "doctor"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "user_id",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@hospital.com",
    "role": "doctor",
    "isActive": true
  }
}
```

---

#### 2. Get All Users

Retrieve all users in the system.

- **URL:** `/api/users`
- **Method:** `GET`
- **Auth Required:** Yes (super_admin)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@hospital.com",
      "role": "doctor",
      "isActive": true,
      "lastLogin": "2026-03-11T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

---

#### 3. Get User by ID

Retrieve a specific user by their ID.

- **URL:** `/api/users/:id`
- **Method:** `GET`
- **Auth Required:** Yes (super_admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@hospital.com",
    "role": "doctor",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### 4. Update User

Update user information.

- **URL:** `/api/users/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (super_admin)

**Request Body:**
```json
{
  "name": "Dr. Jane Smith Updated",
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "user_id",
    "name": "Dr. Jane Smith Updated",
    "email": "jane.smith@hospital.com",
    "role": "doctor",
    "isActive": false
  }
}
```

---

#### 5. Delete User

Delete a user from the system.

- **URL:** `/api/users/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (super_admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Doctor Endpoints

#### 1. Get All Doctors

Retrieve all doctors in the system.

- **URL:** `/api/doctors`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
- `department` (optional): Filter by department
- `isActive` (optional): Filter by active status

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "doctor_id",
      "user": {
        "_id": "user_id",
        "name": "Dr. Jane Smith",
        "email": "jane.smith@hospital.com"
      },
      "department": "Cardiology",
      "specialization": "Heart Surgery",
      "qualification": "MD, MBBS",
      "experience": 10,
      "slotDuration": 15,
      "isActive": true
    }
  ]
}
```

---

#### 2. Get Doctor by ID

Retrieve a specific doctor by their ID.

- **URL:** `/api/doctors/:id`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "doctor_id",
    "user": {
      "_id": "user_id",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@hospital.com"
    },
    "department": "Cardiology",
    "specialization": "Heart Surgery",
    "qualification": "MD, MBBS",
    "experience": 10,
    "slotDuration": 15,
    "isActive": true
  }
}
```

---

#### 3. Get Departments

Retrieve all unique departments.

- **URL:** `/api/doctors/departments`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine"
  ]
}
```

---

#### 4. Get Doctor Schedule

Retrieve a doctor's weekly schedule.

- **URL:** `/api/doctors/:id/schedule`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "day": "monday",
      "start": "09:00",
      "end": "17:00",
      "breaks": [
        {
          "start": "13:00",
          "end": "14:00"
        }
      ]
    },
    {
      "day": "tuesday",
      "start": "09:00",
      "end": "17:00",
      "breaks": []
    }
  ]
}
```

---

#### 5. Update Doctor Schedule

Update a doctor's schedule.

- **URL:** `/api/doctors/:id/schedule`
- **Method:** `PUT`
- **Auth Required:** Yes (super_admin, doctor)

**Request Body:**
```json
{
  "schedule": [
    {
      "day": "monday",
      "start": "09:00",
      "end": "17:00",
      "breaks": [
        {
          "start": "13:00",
          "end": "14:00"
        }
      ]
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Schedule updated successfully",
  "data": {
    "_id": "doctor_id",
    "schedule": [...]
  }
}
```

---

#### 6. Get Doctor Available Slots

Get available appointment slots for a doctor on a specific date.

- **URL:** `/api/doctors/:id/slots`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Example:** `/api/doctors/123/slots?date=2026-03-15`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "doctor": "doctor_id",
    "date": "2026-03-15",
    "slots": [
      {
        "time": "09:00",
        "available": true
      },
      {
        "time": "09:15",
        "available": false
      },
      {
        "time": "09:30",
        "available": true
      }
    ]
  }
}
```

---

#### 7. Update Doctor

Update doctor information.

- **URL:** `/api/doctors/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (super_admin)

**Request Body:**
```json
{
  "department": "Cardiology",
  "specialization": "Interventional Cardiology",
  "experience": 12,
  "slotDuration": 20
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Doctor updated successfully",
  "data": {
    "_id": "doctor_id",
    "department": "Cardiology",
    "specialization": "Interventional Cardiology",
    "experience": 12,
    "slotDuration": 20
  }
}
```

---

#### 8. Delete Doctor

Delete a doctor from the system.

- **URL:** `/api/doctors/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (super_admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Doctor deleted successfully"
}
```

---

### Patient Endpoints

#### 1. Get All Patients

Retrieve all patients in the system.

- **URL:** `/api/patients`
- **Method:** `GET`
- **Auth Required:** Yes (super_admin, doctor, receptionist)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "patient_id",
      "patientId": "PAT000001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "1234567890",
      "age": 35,
      "gender": "male",
      "bloodGroup": "O+",
      "address": "123 Main St"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

---

#### 2. Search Patients

Search for patients by name, email, phone, or patient ID.

- **URL:** `/api/patients/search`
- **Method:** `GET`
- **Auth Required:** Yes (super_admin, doctor, receptionist)

**Query Parameters:**
- `q` (required): Search query

**Example:** `/api/patients/search?q=john`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "patient_id",
      "patientId": "PAT000001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "1234567890"
    }
  ]
}
```

---

#### 3. Get Patient by ID

Retrieve a specific patient by their ID.

- **URL:** `/api/patients/:id`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "patient_id",
    "patientId": "PAT000001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "age": 35,
    "gender": "male",
    "bloodGroup": "O+",
    "dob": "1991-01-15",
    "address": "123 Main St",
    "medicalHistory": "No known allergies"
  }
}
```

---

#### 4. Create Patient

Create a new patient record.

- **URL:** `/api/patients`
- **Method:** `POST`
- **Auth Required:** Yes (super_admin, receptionist)

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "9876543210",
  "age": 28,
  "gender": "female",
  "bloodGroup": "A+",
  "address": "456 Oak Avenue",
  "medicalHistory": "Asthma"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "patient_id",
    "patientId": "PAT000002",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "9876543210",
    "age": 28,
    "gender": "female",
    "bloodGroup": "A+"
  }
}
```

---

#### 5. Update Patient

Update patient information.

- **URL:** `/api/patients/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (super_admin, receptionist)

**Request Body:**
```json
{
  "phone": "9999999999",
  "address": "789 New Street",
  "medicalHistory": "Asthma, allergic to penicillin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "_id": "patient_id",
    "patientId": "PAT000002",
    "name": "Jane Doe",
    "phone": "9999999999",
    "address": "789 New Street"
  }
}
```

---

#### 6. Delete Patient

Delete a patient from the system.

- **URL:** `/api/patients/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (super_admin)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

#### 7. Get Patient Appointments

Retrieve all appointments for a specific patient.

- **URL:** `/api/patients/:id/appointments`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id",
      "doctor": {
        "_id": "doctor_id",
        "user": {
          "name": "Dr. Jane Smith"
        },
        "department": "Cardiology"
      },
      "date": "2026-03-15",
      "slot": "10:00",
      "status": "scheduled",
      "purpose": "Regular checkup"
    }
  ]
}
```

---

### Appointment Endpoints

#### 1. Get All Appointments

Retrieve appointments (filtered by user role).

- **URL:** `/api/appointments`
- **Method:** `GET`
- **Auth Required:** Yes

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, arrived, completed, cancelled)
- `date` (optional): Filter by date (YYYY-MM-DD)
- `doctor` (optional): Filter by doctor ID
- `patient` (optional): Filter by patient ID
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "appointment_id",
      "doctor": {
        "_id": "doctor_id",
        "user": {
          "name": "Dr. Jane Smith"
        },
        "department": "Cardiology"
      },
      "patient": {
        "_id": "patient_id",
        "patientId": "PAT000001",
        "name": "John Doe"
      },
      "date": "2026-03-15",
      "slot": "10:00",
      "status": "scheduled",
      "purpose": "Regular checkup",
      "createdAt": "2026-03-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

---

#### 2. Get Appointment by ID

Retrieve a specific appointment by its ID.

- **URL:** `/api/appointments/:id`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "appointment_id",
    "doctor": {
      "_id": "doctor_id",
      "user": {
        "name": "Dr. Jane Smith"
      },
      "department": "Cardiology"
    },
    "patient": {
      "_id": "patient_id",
      "patientId": "PAT000001",
      "name": "John Doe",
      "phone": "1234567890"
    },
    "date": "2026-03-15",
    "slot": "10:00",
    "status": "scheduled",
    "purpose": "Regular checkup",
    "notes": "",
    "createdAt": "2026-03-10T10:00:00.000Z"
  }
}
```

---

#### 3. Book Appointment

Create a new appointment.

- **URL:** `/api/appointments`
- **Method:** `POST`
- **Auth Required:** Yes (receptionist, patient)

**Request Body:**
```json
{
  "doctor": "doctor_id",
  "patient": "patient_id",
  "date": "2026-03-15",
  "slot": "10:00",
  "purpose": "Regular checkup"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "appointment_id",
    "doctor": "doctor_id",
    "patient": "patient_id",
    "date": "2026-03-15",
    "slot": "10:00",
    "status": "scheduled",
    "purpose": "Regular checkup"
  }
}
```

---

#### 4. Update Appointment

Update an existing appointment.

- **URL:** `/api/appointments/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (super_admin, receptionist, doctor)

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Patient responded well to treatment"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "_id": "appointment_id",
    "status": "completed",
    "notes": "Patient responded well to treatment",
    "completedAt": "2026-03-15T11:00:00.000Z"
  }
}
```

---

#### 5. Mark Appointment as Arrived

Mark a patient as arrived for their appointment.

- **URL:** `/api/appointments/:id/arrive`
- **Method:** `POST`
- **Auth Required:** Yes (receptionist, doctor)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient marked as arrived",
  "data": {
    "_id": "appointment_id",
    "status": "arrived",
    "arrivedAt": "2026-03-15T10:05:00.000Z"
  }
}
```

---

#### 6. Delete Appointment

Delete/cancel an appointment.

- **URL:** `/api/appointments/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (super_admin, receptionist)

**Request Body (optional):**
```json
{
  "cancelReason": "Patient requested cancellation"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

#### 7. Get Appointment Statistics

Get appointment statistics (for dashboard).

- **URL:** `/api/appointments/stats`
- **Method:** `GET`
- **Auth Required:** Yes (super_admin, doctor, receptionist)

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "scheduled": 45,
    "arrived": 10,
    "completed": 90,
    "cancelled": 5,
    "byDoctor": [
      {
        "_id": "doctor_id",
        "name": "Dr. Jane Smith",
        "count": 25
      }
    ],
    "byDepartment": [
      {
        "_id": "Cardiology",
        "count": 30
      }
    ]
  }
}
```

---

## Data Models

### User Model

```javascript
{
  "_id": "ObjectId",
  "name": "String (required, 2-100 chars)",
  "email": "String (required, unique, valid email)",
  "password": "String (required, min 6 chars, hashed)",
  "role": "String (enum: super_admin, doctor, receptionist, patient)",
  "isActive": "Boolean (default: true)",
  "lastLogin": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Patient Model

```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, optional)",
  "patientId": "String (unique, auto-generated: PAT000001)",
  "name": "String (required)",
  "email": "String (optional, valid email)",
  "phone": "String (10-15 digits)",
  "age": "Number (0-150)",
  "gender": "String (enum: male, female, other)",
  "bloodGroup": "String (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)",
  "dob": "Date",
  "address": "String",
  "medicalHistory": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Doctor Model

```javascript
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, required, unique)",
  "department": "String (required)",
  "specialization": "String",
  "qualification": "String",
  "experience": "Number (min: 0)",
  "schedule": [
    {
      "day": "String (enum: sunday-saturday)",
      "start": "String (HH:MM format)",
      "end": "String (HH:MM format)",
      "breaks": [
        {
          "start": "String (HH:MM)",
          "end": "String (HH:MM)"
        }
      ]
    }
  ],
  "slotDuration": "Number (5-120 minutes, default: 15)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Appointment Model

```javascript
{
  "_id": "ObjectId",
  "doctor": "ObjectId (ref: Doctor, required)",
  "patient": "ObjectId (ref: Patient, required)",
  "date": "String (YYYY-MM-DD format, required)",
  "slot": "String (HH:MM format, required)",
  "status": "String (enum: scheduled, arrived, completed, cancelled)",
  "purpose": "String (max 500 chars)",
  "notes": "String (max 1000 chars)",
  "arrivedAt": "Date",
  "completedAt": "Date",
  "cancelledAt": "Date",
  "cancelReason": "String",
  "createdBy": "ObjectId (ref: User)",
  "updatedBy": "ObjectId (ref: User)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---


