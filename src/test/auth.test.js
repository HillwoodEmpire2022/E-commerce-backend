import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app';
import User from '../models/user';
import { signin } from './setup';

describe('User Registration', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it('should register a new user with valid data and email for activation sent', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    expect(response.body).toMatchObject({
      status: 'success',
      data: 'Email to activate your account was sent to your email.',
    });
    expect(response.status).toBe(201);

    const createdUser = await User.findOne({ email: userData.email });

    expect(createdUser).toBeDefined();
    expect(createdUser.activationToken).toBeDefined();
  });

  it('should return a 400 error for invalid data', async () => {
    const invalidUserData = {
      email: 'invalid', // Missing required fields
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(invalidUserData);

    expect(response.status).toBe(400);
  });

  it('should return a 400 error for duplicate email', async () => {
    const user1data = {
      email: 'duplicate@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    await request(app).post('/api/v1/auth/register').send(user1data);

    const user2data = {
      email: 'duplicate@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    const response2 = await request(app)
      .post('/api/v1/auth/register')
      .send(user2data);

    expect(response2.status).toBe(400);
    expect(response2.body).toMatchObject({
      status: 'fail',
      message: 'Email (duplicate@example.com) already in use.',
    });
  });
});

describe('Account Activation', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });
  it('should activate an account with a valid token', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    const res = await request(app).post('/api/v1/auth/register').send(userData);

    const createUser = await User.findOne({ email: userData.email });

    const response = await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: 'success',
      message: 'Account Activated successfully.',
    });

    const updatedUser = await User.findOne({
      email: createUser.email,
    });
    expect(updatedUser.verified).toBe(true);
  });

  it('should return a 404 error if the user is not found', async () => {
    const token = jwt.sign(
      { email: 'nonexistent@user.com' },
      process.env.JWT_SECRET_KEY
    );

    const response = await request(app)
      .get(`/api/v1/auth/activate-account/${token}`)
      .expect(404);

    expect(response.body).toEqual({
      status: 'fail',
      message: 'User not found.',
    });
  });

  it('should return a 400 error if the account is already verified', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    await request(app).post('/api/v1/auth/register').send(userData);

    const createUser = await User.findOne({ email: userData.email });

    await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    const token = jwt.sign(
      { email: 'test@example.com' },
      process.env.JWT_SECRET_KEY
    );

    const response = await request(app).get(
      `/api/v1/auth/activate-account/${token}`
    );

    expect(response.body).toEqual({
      status: 'fail',
      message: 'Email already verified.',
    });
  });
});

describe('userLogin', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it('should return a 400 status code for invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'invalid_email' });

    expect(response.status).toBe(400);
  });

  it('should return a 401 status code for invalid credentials', async () => {
    const user = {
      email: 'user@example.com',
      password: 'password',
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'wrong_password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Invalid credentials.',
    });
  });

  it('should return a 401 status code for unverified account', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    await request(app).post('/api/v1/auth/register').send(userData);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: 'fail',
      message:
        'Account not activated! Check your email to activate your account.',
    });
  });

  it('should return a 200 status code and user data for successful login', async () => {
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
    };

    await request(app).post('/api/v1/auth/register').send(userData);

    const createUser = await User.findOne({ email: userData.email });

    await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.data.user.email).toEqual('test@example.com');
  });
});

describe('sendEmailToResetPassword', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should return a 404 status if the email does not exist', async () => {
    const invalidEmail = 'nonexistent@example.com';
    const resetPasswordResponse = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: invalidEmail,
      });

    expect(resetPasswordResponse.status).toBe(404);
    expect(resetPasswordResponse.body.message).toBe('email does not exist');
  });

  it('should return a 422 status if email validation fails', async () => {
    const invalidEmail = 'emailgmail.com';

    const resetPasswordResponse = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: invalidEmail,
      });

    expect(resetPasswordResponse.status).toBe(422);
    expect(resetPasswordResponse.body.message).toBeDefined();
  });
});

describe('resetUserPassword', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should reset user password with valid token and matching passwords', async () => {
    const user = {
      email: 'test@example.com',
      password: 'oldPassword',
    };

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_KEY
    );
    await User.create(user);

    const newPassword = 'newPassword';

    const response = await request(app)
      .patch(`/api/v1/auth/reset-password/${resetToken}`)
      .send({ newPassword, confirmPassword: newPassword });

    expect(response.status).toBe(201);
    const updatedUser = await User.findOne({ email: user.email }).select(
      '+password'
    );
    const isPasswordValid = await bcrypt.compare(
      newPassword,
      updatedUser.password
    );
    expect(isPasswordValid).toBe(true);
  });

  it('should return a 400 status for password mismatch', async () => {
    const user = {
      email: 'test@example.com',
      password: 'oldPassword',
    };

    const resetToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET_KEY
    );
    await User.create(user);

    const newPassword = 'newPassword';
    const confirmPassword = 'mismatchedPassword';

    const response = await request(app)
      .patch(`/api/v1/auth/reset-password/${resetToken}`)
      .send({ newPassword, confirmPassword });

    expect(response.status).toBe(400);
  });

  it('should return a 404 status if user not found', async () => {
    const nonExistentEmail = 'nonexistent@example.com';
    const resetToken = jwt.sign(
      { email: nonExistentEmail },
      process.env.JWT_SECRET_KEY
    );

    const response = await request(app)
      .patch(`/api/v1/auth/reset-password/${resetToken}`)
      .send({
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      });

    expect(response.status).toBe(404);
  });

  it('should return a 500 status for invalid token', async () => {
    const invalidToken = 'invalidToken';

    const response = await request(app)
      .patch(`/api/v1/auth/reset-password/${invalidToken}`)
      .send({
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('failed to reset user password');
  });
});

describe('Testing update user password after login', () => {
  let token = '',
    userId = '';
  beforeAll(async () => {
    // Register user
    const response = await request(app).post('/api/v1/auth/register').send({
      firstName: 'myfirstname',
      lastName: 'mysecondname',
      email: 'testemail1234@gmail.com',
      password: 'testpass2345',
    });
    token = await response.body.token;
  });

  beforeEach(async () => {
    // Login user
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'testemail1234@gmail.com',
      password: 'testpass2345',
    });
    token = signin({ id: response.id });
    userId = response.body.user ? response.body.user._id : null;
  });

  it('It should return 401 if user is not logged in', async () => {
    const response = await request(app)
      .patch('/api/v1/auth/update-password')
      .send({
        currentPassword: 'testpass2345',
        newPassword: 'newtestpass2345',
        confirmPassword: 'newtestpass2345',
      });
    expect(response.statusCode).toBe(401);
  });

  it('It should return 401 for invalid password', async () => {
    const response = await request(app)
      .patch('/api/v1/auth/update-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'invalidpassword',
        newPassword: 'newtestpass2345',
        confirmPassword: 'newtestpass2345',
      });
    expect(response.statusCode).toBe(401);
  });
});

describe('user update profile data', () => {
  let token = '',
    userId = '';
  beforeAll(async () => {
    // Register user
    const response = await request(app).post('/api/v1/auth/register').send({
      firstName: 'myfirstname1',
      lastName: 'mysecondname2',
      email: 'testemail1234@gmail.com',
      password: 'testpass2345',
    });
    token = await response.body.token;
  });

  beforeEach(async () => {
    // Login user
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'testemail1234@gmail.com',
      password: 'testpass2345',
    });
    token = signin({ id: response.id });
    userId = response.body.user ? response.body.user._id : null;
  });

  it('it should return 401 if user is not loged in', async () => {
    const response = await request(app).patch('/api/v1/auth/profile-data');
    expect(response.status).toBe(401);
  });

  it('it should return 401 if user is not found', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile-data')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'ben',
        lastName: 'big',
      });
    expect(res.statusCode).toBe(401);
  });
});
