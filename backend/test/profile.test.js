process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const app = require("../server");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Profile API", () => {
  let userId;
  const password = "123456";

  // Setup: create a test user before tests
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName: "Test User",
      email: `profile_${Date.now()}@mail.com`,
      password: hashed,
    });
    const savedUser = await newUser.save();
    userId = savedUser._id.toString();
  });

  //  Cleanup after tests
  after(async () => {
    // Delete all test users
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test 1: Get user profile
  it("should get user profile successfully", (done) => {
    chai
      .request(app)
      .get(`/api/auth/${userId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("id", userId);
        expect(res.body).to.have.property("fullName", "Test User");
        done();
      });
  });

  // Test 2: Update profile
  it("should update profile successfully", (done) => {
    chai
      .request(app)
      .put(`/api/auth/${userId}`)
      .send({ fullName: "Updated User", email: "updated@mail.com" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.user.fullName).to.equal("Updated User");
        expect(res.body.user.email).to.equal("updated@mail.com");
        done();
      });
  });

  // Test 3: Upload profile image
  it("should upload profile image successfully", (done) => {
    const tempImagePath = path.join(__dirname, "test-image.png");

    chai
      .request(app)
      .post(`/api/auth/${userId}/upload`)
      .set("Content-Type", "multipart/form-data")
      .attach("image", fs.readFileSync(tempImagePath), "test-image.png")
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Normalize path for Windows
        const uploadedPath = res.body.image.replace(/\\/g, "/");
        expect(uploadedPath).to.include("uploads/");
        done();
      });
  });

  // Test 4: Remove profile image
  it("should remove profile image successfully", (done) => {
    chai
      .request(app)
      .delete(`/api/auth/${userId}/remove-image`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.match(/removed/i);
        done();
      });
  });

  // Test 5: Get profile for non-existent user
  it("should return 404 for non-existent user", (done) => {
    const fakeId = "64b3d5f9e1a2b3c4d5f67890";
    chai
      .request(app)
      .get(`/api/auth/${fakeId}`)
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.message).to.match(/not found/i);
        done();
      });
  });
});
