import request from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import SellerProfile from '../models/sellerProfile.js';
import { signin } from './setup';

let adminUser;
let token;

// describe('Profile Tests', () => {
//   beforeAll(async () => {
//     await User.deleteMany({});

//     await SellerProfile.deleteMany({});
//     // Create user with admin role
//     adminUser = await User.create({
//       email: 'admin@example.com',
//       firstName: 'John',
//       lastName: 'Doe',
//       password: 'test1234',
//       confirmPassword: 'test1234',
//       role: 'admin',
//       verified: true,
//     });

//     token = signin({
//       id: adminUser.id,
//       role: adminUser.role,
//     });
//   });

//   // it('should create a profile upon successful registration', async () => {
//   //   const userData = {
//   //     email: 'uniquetest1@example.com',
//   //     firstName: 'John',
//   //     lastName: 'Doe',
//   //     password: 'test1234',
//   //     confirmPassword: 'test1234',
//   //     role: 'seller',
//   //   };

//   //   const response = await request(app).post('/api/v1/auth/register').send(userData);

//   //   //   Activate Account
//   //   const acticate = await request(app).get(`/api/v1/auth/activate-account/${response.body.activationToken}`);

//   //   // Find Created User
//   //   const user = await User.findOne({
//   //     email: userData.email,
//   //   });

//   //   // Find Profile
//   //   const profile = await SellerProfile.findOne({
//   //     user: user._id,
//   //   });

//   //   expect(profile.user).toEqual(user._id);
//   // });

//   // it("should return profile of a current logged in user", async () => {
//   //   const response = await request(app)
//   //     .post("/api/v1/auth/login")
//   //     .send({ email: "uniquetest1@example.com", password: "test1234" });

//   //   // Get current logged User Profile
//   //   const profile = await request(app)
//   //     .get("/api/v1/profiles")
//   //     .set("Authorization", `Bearer ${response.body.token}`);

//   //   expect(profile.body.data.profile.user).toEqual(response.body.data.user.id);
//   // });

//   // it("should return profile a user by his id", async () => {
//   //   const response = await request(app)
//   //     .post("/api/v1/auth/login")
//   //     .send({ email: "uniquetest1@example.com", password: "test1234" });

//   //   // Get current logged User Profile
//   //   const profile1 = await request(app)
//   //     .get("/api/v1/profiles")
//   //     .set("Authorization", `Bearer ${response.body.token}`);

//   //   // Get current logged User Profile
//   //   const profile = await request(app)
//   //     .get(`/api/v1/profiles/${profile1.body.data.profile.id}`)
//   //     .set("Authorization", `Bearer ${token}`);

//   //   expect(profile.body.data.profile.user).toEqual(response.body.data.user.id);
//   // });

//   // it("should not update the profile of currently logged in user if no file uploaded", async () => {
//   //   const loginRes = await request(app)
//   //     .post("/api/v1/auth/login")
//   //     .send({ email: "uniquetest1@example.com", password: "test1234" });

//   //   const response = await request(app)
//   //     .patch("/api/v1/profiles")
//   //     .set("Authorization", `Bearer ${loginRes.body.token}`)
//   //     .send({
//   //       companyEmail: "compemail@test.com",
//   //       phoneNumber: "0788343322",
//   //       companyName: "Comp Name",
//   //       website: "example.com",
//   //       logo: "https://example.com/logo.png",
//   //       bankAccount: {
//   //         bank: "BK Bank",
//   //         accountName: "BK Bank",
//   //         accountNumber: 83498343,
//   //         accountHolderName: "Eric",
//   //       },
//   //       cardNumber: 743879839823,

//   //       locations: [
//   //         {
//   //           address: "Kigali Rwanda, KN 24",
//   //           coordinates: [-23.382, 11.29],
//   //         },
//   //       ],
//   //     });
//   //   expect(response.status).toBe(400);
//   //   expect(response.body).toEqual({
//   //     message: "No file uploaded",
//   //   });
//   // });
// });

describe('admin list all sellers', () => {
  beforeAll(async () => {
    await User.deleteMany({});

    await SellerProfile.deleteMany({});
    // Create user with admin role
    adminUser = await User.create({
      email: 'admin@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'admin',
      verified: true,
    });

    token = signin({
      id: adminUser.id,
      role: adminUser.role,
    });
  });

  it('it should return 401 if user is not logeged in', async () => {
    const res = await request(app).get('/api/v1/sellers');
    expect(res.statusCode).toBe(401);
  });

  it('it should return 404 if no sellers', async () => {
    const response = await request(app).get('/api/v1/sellers').set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
  });

  it('it should return 201 if admi get all sellers', async () => {
    const sellerUser = await User.create({
      email: 'seller@example.com',
      firstName: 'Seller',
      lastName: 'One',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'seller',
      verified: true,
    });

    await SellerProfile.create({ user: sellerUser._id });
    const response = await request(app).get('/api/v1/sellers').set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.sellers).toHaveLength(1);
  });
});
