const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for testing/development (can restrict in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
