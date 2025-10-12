process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

chai.use(chaiHttp);
const { expect } = chai;

describe("Auth Signup API", function () {
  this.timeout(10000);

  before(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it("should successfully register a new user", async () => {
    const uniqueUser = {
      fullName: "Test User " + Date.now(),
      email: `test_${Date.now()}@mail.com`,
      password: "123456",
    };

    const res = await chai.request(app).post("/api/auth/signup").send(uniqueUser);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("message").that.includes("success");
  });

  it("should return 400 if email already exists", async () => {
    const duplicateEmail = `duplicate_${Date.now()}@mail.com`;

    // Register first
    await chai.request(app).post("/api/auth/signup").send({
      fullName: "First User",
      email: duplicateEmail,
      password: "123456",
    });

    // Try duplicate
    const res = await chai.request(app).post("/api/auth/signup").send({
      fullName: "Second User",
      email: duplicateEmail,
      password: "123456",
    });

    expect(res).to.have.status(400);
    expect(res.body.message.toLowerCase()).to.include("already");
  });
});
