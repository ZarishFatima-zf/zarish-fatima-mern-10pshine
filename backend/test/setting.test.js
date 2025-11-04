process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Settings API", () => {
  let userId;
  let oldPassword = "123456";
  let newPassword = "654321";

  // Setup: create a test user before running tests
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const hashed = await bcrypt.hash(oldPassword, 10);
    const newUser = new User({
      fullName: "Test User",
      email: `setting_${Date.now()}@mail.com`,
      password: hashed,
    });
    const savedUser = await newUser.save();
    userId = savedUser._id.toString();
  });

  //Cleanup after tests
  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test 1: Successful password change
  it("should change password successfully", (done) => {
    chai
      .request(app)
      .post("/api/auth/change-password")
      .send({
        userId,
        oldPassword,
        newPassword,
        confirmPassword: newPassword,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").match(/success/i);
        done();
      });
  });

  //Test 2: Old password incorrect
  it("should return 400 if old password is incorrect", (done) => {
    chai
      .request(app)
      .post("/api/auth/change-password")
      .send({
        userId,
        oldPassword: "wrongpass",
        newPassword: "newpass123",
        confirmPassword: "newpass123",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.match(/incorrect/i);
        done();
      });
  });

  //Test 3: Passwords do not match
  it("should return 400 if new passwords do not match", (done) => {
    chai
      .request(app)
      .post("/api/auth/change-password")
      .send({
        userId,
        oldPassword: newPassword, 
        newPassword: "abc123",
        confirmPassword: "xyz123",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.match(/match/i);
        done();
      });
  });

  // Test 4: Delete account successfully
  it("should delete account successfully", (done) => {
    chai
      .request(app)
      .post("/api/auth/delete-account")
      .send({ userId })
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  // Test 5: Try deleting again → user not found
  it("should return 404 when deleting non-existent account", (done) => {
    chai
      .request(app)
      .post("/api/auth/delete-account")
      .send({ userId })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body.message).to.match(/not found/i);
        done();
      });
  });
});
