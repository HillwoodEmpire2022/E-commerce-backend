import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 3000;

async function init() {
  if (
    !process.env.PRODUCTION_MONGODB_URI ||
    !process.env.DEVELOPMENT_MONGODB_URI
  ) {
    throw new Error('DATABASE URI missing!');
  }

  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT Secret missing');
  }
  try {
    const nodeEnv = process.env.NODE_ENV;
    const devDb = process.env.DEVELOPMENT_MONGODB_URI;
    const prodDb = process.env.PRODUCTION_MONGODB_URI;

    let databaseUrl =
      nodeEnv === 'development' ? devDb : prodDb;

    await mongoose.connect(databaseUrl);

    app.listen(PORT, () => {
      console.log('🔢 Database connection successful!');
      console.log(`🚀 Server running on port ${PORT}...`);
    });
  } catch (error) {
    console.error('ERROR 🔥', error);
  }
}

init();
