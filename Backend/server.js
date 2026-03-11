const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./confiq/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const authRouter = require('./routes/authRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const userRouter = require('./routes/userRoutes');
const doctorRouter = require('./routes/doctorRoute');
const patientRouter = require('./routes/patientRoutes');

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/users', userRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/patients', patientRouter);

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'EMR Appointment System API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   EMR Appointment System API                      ║
║   Server is running on port ${PORT}                ║
║   Environment: ${process.env.NODE_ENV || 'development'}               ║
║   URL: http://localhost:${PORT}                    ║
╚═══════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // In production, you might want to close server gracefully
    // server.close(() => process.exit(1));
});

module.exports = app;
