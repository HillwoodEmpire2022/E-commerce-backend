import request from 'supertest';
import User from '../models/user';
import { signin } from './setup';
import Category from '../models/category';
import app from '../app';
import Product from '../models/product';
import SubCategory from '../models/subcategory';
import ProductClass from '../models/productClass';

let adminUser, sellerUSer, sellerUSer2, customer;
// Classes
let clothing, electronics;
// Categories
let smartphones_and_accessories;
// SubCategories
let smartphones;
let token;

describe('Create Products', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await ProductClass.deleteMany({});

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

    sellerUSer = await User.create({
      email: 'seller@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'seller',
      verified: true,
    });
    sellerUSer2 = await User.create({
      email: 'seller2@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'seller',
      verified: true,
    });
    customer = await User.create({
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
      verified: true,
    });

    token = signin({
      id: adminUser.id,
      role: adminUser.role,
    });

    // Create product using ProductClass model
    clothing = await ProductClass.create({
      name: 'Clothing',
    });

    electronics = await ProductClass.create({
      name: 'Electronics',
    });

    smartphones_and_accessories = await Category.create({
      name: 'smartphones and ',
      productClass: electronics._id,
    });
    smartphones = await Category.create({
      name: 'Smartphones',
      productClass: electronics._id,
    });
  });

  // Successfull Creations
  it('should create a product by admin', async () => {
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    console.log('*************************8', response.body);

    expect(response.status).toBe(201);
    expect(response.body.data.product).toMatchObject({
      name: newProduct.name,
      description: 'Description',
      stockQuantity: 400,
      price: newProduct.price + newProduct.price * 0.04,
      currency: 'RWF',
      hasColors: false,
    });
  });

  it('should create product by seller', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(201);
    expect(response.body.data.product).toMatchObject({
      name: newProduct.name,
      description: 'Description',
      description: 'Description',
      stockQuantity: 400,
      price: newProduct.price + newProduct.price * 0.04,
      currency: 'RWF',
      hasColors: false,
    });
  });

  // Seller Validations
  it('should not create product if seller is missing', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'Seller is Invalid or not provided',
    });
  });

  it('should not create product if seller is not found', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: adminUser._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'There is no seller that matches the provided seller Id.',
    });
  });

  it('should not create product if seller tries to create product for another seller', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer2._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'You are not allowed to create products for other sellers',
    });
  });

  it('should not create product if customer tries to create product', async () => {
    const token = signin({
      id: customer._id,
      role: customer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer2._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'Access denied! You are not allowed to perform this operation.',
    });
  });

  // Validation Tests
  it('should not create product if name is missing', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'name is required',
    });
  });

  it('should not create product if productClass is missing', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'productClass is Invalid or not provided',
    });
  });

  it('should not create product if category is missing', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'Category is Invalid or not provided',
    });
  });

  it('should not create product if price is missing', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: 'fail',
      message: 'price is required',
    });
  });

  // Product Existenace Error
  it('should return 400 if product exists for same seller and name', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    await request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(newProduct);

    const duplicate = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    expect(duplicate.status).toBe(400);
  });

  // Unsuccessfull Creation due to ProducClass, Category, and Brand Errors
  it('should return 400 if product class is not found', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: '60c72b2f9b1d8b3a3c8e4f1b',
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const res = await request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(newProduct);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('ProductClass or category or subcategory not found');
  });

  it('should return 400 if category is not found', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: clothing._id,
      category: '60c72b2f9b1d8b3a3c8e4f1b',
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const res = await request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(newProduct);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('ProductClass or category or subcategory not found');
  });

  it('should return 400 if subcategory is not found', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      subCategory: '60c72b2f9b1d8b3a3c8e4f1b',
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const res = await request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(newProduct);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('ProductClass or category or subcategory not found');
  });

  it('should return 400 if brand is not found', async () => {
    const token = signin({
      id: sellerUSer._id,
      role: sellerUSer.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      subCategory: smartphones._id,
      description: 'Description',
      brand: '60c72b2f9b1d8b3a3c8e4f1b',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const res = await request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(newProduct);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('ProductClass or category or subcategory not found');
  });
});

describe('Update Products', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await ProductClass.deleteMany({});

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

    sellerUSer = await User.create({
      email: 'seller@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'seller',
      verified: true,
    });
    sellerUSer2 = await User.create({
      email: 'seller2@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'seller',
      verified: true,
    });
    customer = await User.create({
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'test1234',
      confirmPassword: 'test1234',
      role: 'customer',
      verified: true,
    });

    token = signin({
      id: adminUser.id,
      role: adminUser.role,
    });

    // Create product using ProductClass model
    clothing = await ProductClass.create({
      name: 'Clothing',
    });

    electronics = await ProductClass.create({
      name: 'Electronics',
    });

    smartphones_and_accessories = await Category.create({
      name: 'smartphones and ',
      productClass: electronics._id,
    });
    smartphones = await Category.create({
      name: 'Smartphones',
      productClass: electronics._id,
    });
  });

  it('should update product by admin', async () => {
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${response.body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'new name',
        price: 2000,
        stockQuantity: 500,
        description: 'new description',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.product).toMatchObject({
      name: 'new name',
    });
  });

  it('should update seller if user is admin', async () => {
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${response.body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        seller: sellerUSer2._id,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.product).toMatchObject({
      name: newProduct.name,
    });
  });

  it('should update product by owner seller', async () => {
    const seller2Totoken = signin({
      id: sellerUSer2._id,
      role: sellerUSer2.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer2._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${response.body.data.product.id}`)
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send({
        name: 'new name',
        price: 2000,
        stockQuantity: 500,
        description: 'new description',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.product).toMatchObject({
      name: 'new name',
    });
  });

  it('should not update product if it does not exist', async () => {
    const seller2Totoken = signin({
      id: sellerUSer2._id,
      role: sellerUSer2.role,
    });
    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer2._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${customer._id}`)
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send({
        name: 'new name',
        price: 2000,
        stockQuantity: 500,
        description: 'new description',
      });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      status: 'fail',
      message: 'Product not found',
    });
  });

  it('should not update seller if user is not admin', async () => {
    const seller2Totoken = signin({
      id: sellerUSer2._id,
      role: sellerUSer2.role,
    });

    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${response.body.data.product.id}`)
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send({
        seller: sellerUSer._id,
      });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: 'fail',
      message: 'Access denied! You are not allowed to perform this operation.',
    });
  });

  it('should not update by a seller if the seller does not own the product', async () => {
    const seller2Totoken = signin({
      id: sellerUSer2._id,
      role: sellerUSer2.role,
    });

    const newProduct = {
      name: `test product ${Date.now()}`,
      seller: sellerUSer._id,
      productClass: electronics._id,
      category: smartphones_and_accessories._id,
      description: 'Description',
      stockQuantity: 400,
      price: 1000,
      productImages: {
        productThumbnail: {
          url: 'http://example.com/thumbnail.jpg',
        },
      },
    };

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(newProduct);

    const res = await request(app)
      .patch(`/api/v1/products/${response.body.data.product.id}`)
      .set('Authorization', `Bearer ${seller2Totoken}`)
      .send({
        name: 'new name',
        price: 2000,
        stockQuantity: 500,
        description: 'new description',
      });

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      status: 'fail',
      message: 'Access denied! You cannot update a product that does not belong to you.',
    });
  });
});
