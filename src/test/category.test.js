import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user";
import Category from "../models/category";
import { signin } from "./setup";
import SubCategory from "../models/subcategory";

let adminUser;
let nonAdminUSer;
let token, nonAdminToken;
let category;

describe("Category Tests", () => {
  beforeAll(async () => {
    // Delete All Categories
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await User.deleteMany({});

    // Create user with admin role
    adminUser = await User.create({
      email: "admin@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "admin",
      verified: true,
    });

    nonAdminUSer = await User.create({
      email: "nonadmin@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "customer",
      verified: true,
    });

    token = signin({ id: adminUser.id, role: adminUser.role });
    nonAdminToken = signin({ id: nonAdminUSer.id, role: nonAdminUSer.role });
  });

  it("should create a new category with valid data and by admin user", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Category" });

    category = response.body.data.category;

    expect(response.status).toBe(201);

    const createdCategory = await Category.findOne({ name: "New Category" });
    expect(createdCategory).toBeDefined();
  });

  it("should return a 400 error if category already exists", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Category" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("already exists.");
  });

  it("should return a 403 error if user is not admin", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .send({ name: "New Category" });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      status: "fail",
      message: "Access denied! You are not allowed to perform this operation.",
    });
  });

  it("should return a list of categories with populated subCategories for admin user", async () => {
    const res = await request(app)
      .get("/api/v1/categories")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it("should not return a list of categories if no user logged in", async () => {
    const res = await request(app).get("/api/v1/categories");

    expect(res.body).toMatchObject({
      status: "fail",
      message: "Access denied. Please login again.",
    });
  });

  it("should not return a list of categories user is not admin", async () => {
    const res = await request(app)
      .get("/api/v1/categories")
      .set("Authorization", `Bearer ${nonAdminToken}`);

    expect(res.body).toMatchObject({
      status: "fail",
      message: "Access denied! You are not allowed to perform this operation.",
    });
  });

  test("Should create a subcategory with valid data", async () => {
    const response = await request(app)
      .post("/api/v1/subcategories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Subcategory", category: category.id });

    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      status: "success",
      data: {
        subCategory: {
          name: "Test Subcategory",
          category: category.id,
        },
      },
    });
  });

  test("Should not create a subcategory if category is not present.", async () => {
    const randomId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .post("/api/v1/subcategories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Subcategory", category: randomId.toString() });

    expect(response.status).toBe(400);

    expect(response.body).toMatchObject({
      status: "fail",
      message: "No category found for subcategory you are creating.",
    });
  });

  test("Should not create a subcategory if user is not admin.", async () => {
    const response = await request(app)
      .post("/api/v1/subcategories")
      .set("Authorization", `Bearer ${nonAdminToken}`)
      .send({ name: "Test Subcategory", category: category.id });

    expect(response.status).toBe(403);

    expect(response.body).toMatchObject({
      status: "fail",
      message: "Access denied! You are not allowed to perform this operation.",
    });
  });
});
