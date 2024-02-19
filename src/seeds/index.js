import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';

import Category from './../models/category.js';
import SubCategory from './../models/subcategory.js';
import User from './../models/user.js';
import Product from './../models/product.js';
import SellerProfile from './../models/sellerProfile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

// Connect to mongodb
async function connectDb() {
  try {
    console.log('Connecting to database.....');
    await mongoose.connect(process.env.DEVELOPMENT_MONGODB_URI);
  } catch (error) {
    console.log('ERROR **', error);
  }
}

async function seedCategories() {
  const filePath = path.resolve(__dirname, './data/categories.json');
  const rowCategories = await readFile(filePath);
  const categories = JSON.parse(rowCategories);

  await Category.deleteMany({});
  await Category.insertMany(categories);
}

async function seedSubcategories() {
  const filePath = path.resolve(__dirname, './data/subcategories.json');
  const rowSubcategories = await readFile(filePath);
  const subcategories = JSON.parse(rowSubcategories);

  await SubCategory.deleteMany({});
  await SubCategory.insertMany(subcategories);
}

async function seedUsers() {
  const filePath = path.resolve(__dirname, './data/users.json');
  const rowUsers = await readFile(filePath);
  let users = JSON.parse(rowUsers);

  users.push({
    firstName: 'admin',
    lastName: 'admin',
    email: 'olivieradmin@yopmail.com',
    role: 'admin',
    password: 'test12345',
    verified: true,
  });

  await User.deleteMany({});

  users = await Promise.all(
    users.map(async (user) => {
      return {
        ...user,
        password: await bcrypt.hash(user.password, 12),
      };
    })
  );

  await User.insertMany(users);

  // Seed Profiles
  await SellerProfile.deleteMany({});
  const dbUsers = await User.find({ role: 'seller' });

  dbUsers.forEach(async (user) => {
    await SellerProfile.create({ user: user._id });
  });
}

async function seedProducts() {
  const filePath = path.resolve(__dirname, './data/products.json');
  const rowProducts = await readFile(filePath);
  let products = JSON.parse(rowProducts);

  // Get all seller ids
  const sellers = await User.find({ role: 'seller' }, ['_id']);

  // Loop over product and assign sellerID which is randomly selected from the sellers
  products = products.map((product) => {
    const sellerPos = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
    return {
      ...product,
      seller: sellers[sellerPos]._id,
    };
  });

  await Product.deleteMany({});
  await Product.insertMany(products);
}

async function init() {
  try {
    // Connect db
    await connectDb();
    console.log('DB Coneected');

    console.log('Seeding in progress.....');
    // Upload products
    await seedCategories();

    // Seed Subcategories
    await seedSubcategories();

    // Seed Users
    await seedUsers();

    // Seed Products
    // await seedProducts();

    console.log('Seeding Complete.');
    process.exit(0);
  } catch (error) {
    console.log('Error Seeding: ', error);
    process.exit(1);
  }
}

init();
