import request from "supertest";
import app from "../app";
import Product from "../models/product";
import mongoose from "mongoose";

let product;

describe("GET /products/:productId", () => {
  beforeAll(async () => {
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
