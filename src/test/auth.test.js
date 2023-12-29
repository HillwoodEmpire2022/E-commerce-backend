import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import User from "../models/user";

describe("User Registration", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it("should register a new user with valid data and email for activation sent", async () => {
    const userData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(userData);

    expect(response.body).toMatchObject({
      status: "success",
      data: "Email to activate your account was sent to your email.",
    });
    expect(response.status).toBe(201);

    const createdUser = await User.findOne({ email: userData.email });

    expect(createdUser).toBeDefined();
    expect(createdUser.activationToken).toBeDefined();
  });

  it("should return a 400 error for invalid data", async () => {
    const invalidUserData = {
      email: "invalid", // Missing required fields
    };

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(invalidUserData);

    expect(response.status).toBe(400);
  });

  it("should return a 400 error for duplicate email", async () => {
    const user1data = {
      email: "duplicate@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    await request(app).post("/api/v1/auth/register").send(user1data);

    const user2data = {
      email: "duplicate@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    const response2 = await request(app)
      .post("/api/v1/auth/register")
      .send(user2data);

    expect(response2.status).toBe(400);
    expect(response2.body).toMatchObject({
      status: "fail",
      message: "Email (duplicate@example.com) already in use.",
    });
  });
});

describe("Account Activation", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });
  it("should activate an account with a valid token", async () => {
    const userData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    const res = await request(app).post("/api/v1/auth/register").send(userData);

    const createUser = await User.findOne({ email: userData.email });

    const response = await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "success",
      message: "Account Activated successfully.",
    });

    const updatedUser = await User.findOne({ email: createUser.email });
    expect(updatedUser.verified).toBe(true);
  });

  it("should return a 404 error if the user is not found", async () => {
    const token = jwt.sign(
      { email: "nonexistent@user.com" },
      process.env.JWT_SECRET_KEY
    );

    const response = await request(app)
      .get(`/api/v1/auth/activate-account/${token}`)
      .expect(404);

    expect(response.body).toEqual({
      status: "fail",
      message: "User not found.",
    });
  });

  it("should return a 400 error if the account is already verified", async () => {
    const userData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    await request(app).post("/api/v1/auth/register").send(userData);

    const createUser = await User.findOne({ email: userData.email });

    await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    const token = jwt.sign(
      { email: "test@example.com" },
      process.env.JWT_SECRET_KEY
    );

    const response = await request(app).get(
      `/api/v1/auth/activate-account/${token}`
    );

    expect(response.body).toEqual({
      status: "fail",
      message: "Email already verified.",
    });
  });
});

describe("userLogin", () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  it("should return a 400 status code for invalid input", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "invalid_email" });

    expect(response.status).toBe(400);
  });

  it("should return a 401 status code for invalid credentials", async () => {
    const user = {
      email: "user@example.com",
      password: "password",
    };

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: user.email, password: "wrong_password" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "fail",
      message: "Invalid credentials.",
    });
  });

  it("should return a 401 status code for unverified account", async () => {
    const userData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    await request(app).post("/api/v1/auth/register").send(userData);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "fail",
      message:
        "Account not activated! Check your email to activate your account.",
    });
  });

  it("should return a 200 status code and user data for successful login", async () => {
    const userData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
    };

    await request(app).post("/api/v1/auth/register").send(userData);

    const createUser = await User.findOne({ email: userData.email });

    await request(app).get(
      `/api/v1/auth/activate-account/${createUser.activationToken}`
    );

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userData.email, password: userData.password });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.data.user.email).toEqual("test@example.com");
  });
});
