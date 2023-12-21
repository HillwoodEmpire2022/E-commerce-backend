import mongoose from "mongoose";

// Codes to run before all of our tests
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.TEST_DB);
  } catch (error) {
    console.log("Error ***** ", error);
  }
});

// // Before each and every test
beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Hook that runs after all tests have run
afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

// export const signin = async () => {
//   const email = "test@test.com";
//   const password = "test";

//   const response = await request(app)
//     .post("/api/users/signup")
//     .send({
//       email,
//       password,
//     })
//     .expect(201);

//   const cookie = response.get("set-Cookie");
//   return cookie;
// };
