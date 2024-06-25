import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 3000;

async function init() {
  const nodeEnv = process.env.NODE_ENV;
  const devDb = process.env.DEVELOPMENT_MONGODB_URI;
  const prodDb = process.env.PRODUCTION_MONGODB_URI;
  const stagingDb = process.env.DEVELOPMENT_MONGODB_URI;

  // Node_ENV = dev and no devDb
  if (nodeEnv === 'development' && !devDb) {
    throw new Error('Development DATABASE URI missing!');
  }

  // Node_ENV = prod and no prodDb
  if (nodeEnv === 'production' && !prodDb) {
    throw new Error('Production DATABASE URI missing!');
  }

  // Node_ENV = staging and no stagingDb
  if (nodeEnv === 'staging' && !stagingDb) {
    throw new Error('Staging DATABASE URI missing!');
  }

  try {
    let databaseUrl = nodeEnv === 'development' ? devDb : nodeEnv === 'production' ? prodDb : stagingDb;
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
