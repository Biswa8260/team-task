require('dotenv').config();
const app = require('./app');
const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
