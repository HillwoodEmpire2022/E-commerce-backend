import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Codes to run before all of our tests
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.TEST_DB);
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await ProductClass.deleteMany({});
  } catch (error) {
    console.log('Error ***** ', error);
  }
});

// Hook that runs after all tests have run
afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

export const signin = ({ id, role }) => {
  return jwt.sign(
    { userInfo: { id, role } },
    process.env.JWT_SECRET_KEY
  );
};
