import request from "supertest";
import app from "../app";
import Product from "../models/product";
import { signin } from "./setup";
import User from "../models/user";
import mongoose from "mongoose";

let product;

describe("GET /products/:productId", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    product = await Product.create({
      name: "shoes",
      price: 23,
      productImages: { productThumbnail: { url: "url" } },
      seller: "659462a0ba007e2776643dcd",
      category: "659462a0ba007e2776643dcd",
      subcategory: "659462a0ba007e2776643dcd",
    });
  });

  it("should return a product if a valid ID is provided", async () => {
    const response = await request(app).get(`/api/v1/products/${product._id}`);

    expect(response.status).toBe(200);
  });

  it("should return 404 if the provided ID does not exist", async () => {
    const response = await request(app).get(
      `/api/v1/products/659462a0ba007e2776643dcd`
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "fail",
      message: "Product not found.",
    });
  });
});

describe("updateProductData route", () => {
  let adminUser,
    sellerUser,
    seller2User,
    customerUser,
    adminToken,
    sellerToken,
    seller2Token,
    customerToken,
    product;

  beforeAll(async () => {
    // Delete All Categories
    await User.deleteMany({});
    await Product.deleteMany({});

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

    sellerUser = await User.create({
      email: "seller@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "seller",
      verified: true,
    });

    seller2User = await User.create({
      email: "seller2@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "seller",
      verified: true,
    });

    customerUser = await User.create({
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "test1234",
      confirmPassword: "test1234",
      role: "seller",
      verified: true,
    });

    product = await Product.create({
      name: "shoes 2",
      price: 23,
      productImages: { productThumbnail: { url: "url" } },
      seller: sellerUser._id,
      category: "659462a0ba007e2776643dcd",
      subcategory: "659462a0ba007e2776643dcd",
    });

    adminToken = signin({ id: adminUser.id, role: adminUser.role });
    sellerToken = signin({ id: sellerUser.id, role: sellerUser.role });
    seller2Token = signin({ id: seller2User.id, role: seller2User.role });
    customerToken = signin({ id: customerUser.id, role: customerUser.role });
  });

  it("should return 403 if non-admin user tries to update seller information", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${product._id}`)
      .send({ seller: "8934uuj439842uj3298" })
      .set("Authorization", `Bearer ${sellerToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      status: "fail",
      message: "Acces denied! You are not allowed to perform this operation.",
    });
  });

  it("should return 404 if product is not found", async () => {
    const newObjectId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/v1/products/${newObjectId}`)
      .send({ name: "new name" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(404);
    expect(res.body).toEqual({
      status: "fail",
      message: "Product not found.",
    });
  });

  it("should return 404 if non-admin user tries to update a product that does not belong to them", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${product.id}`)
      .send({ name: "new name" })
      .set("Authorization", `Bearer ${seller2Token}`);

    expect(res.status).toEqual(404);
    expect(res.body).toEqual({
      status: "fail",
      message: "Product not found.",
    });
  });

  it("should update product if user is admin", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${product.id}`)
      .send({ name: "new name" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("success");
  });

  it("should update product if user is the owner", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/${product.id}`)
      .send({ name: "new name" })
      .set("Authorization", `Bearer ${sellerToken}`);

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual("success");
  });
});
