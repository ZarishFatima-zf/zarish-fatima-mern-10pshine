process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const bcrypt = require("bcryptjs");
const app = require("../server"); // Your Express app
const User = require("../models/User");
const logger = require("../logger");

const { expect } = chai;
chai.use(chaiHttp);

describe("🔐 Login User API", () => {
  let findOneStub, bcryptCompareStub, loggerInfoStub, loggerWarnStub, loggerErrorStub;

  beforeEach(() => {
    // Stub database and logger
    findOneStub = sinon.stub(User, "findOne");
    bcryptCompareStub = sinon.stub(bcrypt, "compare");
    loggerInfoStub = sinon.stub(logger, "info");
    loggerWarnStub = sinon.stub(logger, "warn");
    loggerErrorStub = sinon.stub(logger, "error");
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubs after each test
  });

  // ✅ Test 1: Successful Login
  it("should login successfully with valid credentials", async () => {
    const mockUser = {
      _id: "12345",
      fullName: "Test User",
      email: "test@example.com",
      password: "hashedPassword",
    };

    findOneStub.resolves(mockUser);
    bcryptCompareStub.resolves(true);

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "123456" });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message", "Login successful");
    expect(res.body.user).to.include({
      id: "12345",
      fullName: "Test User",
      email: "test@example.com",
    });

    sinon.assert.calledWith(loggerInfoStub, sinon.match("Login attempt for email: test@example.com"));
    sinon.assert.calledWith(loggerInfoStub, sinon.match("Login successful for user: test@example.com"));
  });

  // 🚫 Test 2: Invalid Email
  it("should return 400 if user not found", async () => {
    findOneStub.resolves(null);

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ email: "notfound@example.com", password: "123456" });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message", "Invalid email or password");
    sinon.assert.calledWith(loggerWarnStub, sinon.match("Login failed - user not found"));
  });

  // 🚫 Test 3: Invalid Password
  it("should return 400 if password is incorrect", async () => {
    const mockUser = { email: "test@example.com", password: "hashedPassword" };
    findOneStub.resolves(mockUser);
    bcryptCompareStub.resolves(false);

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpass" });

    expect(res).to.have.status(400);
    expect(res.body).to.have.property("message", "Invalid email or password");
    sinon.assert.calledWith(loggerWarnStub, sinon.match("Login failed - invalid password"));
  });

  // 💥 Test 4: Server Error
  it("should return 500 if an error occurs", async () => {
    findOneStub.rejects(new Error("Database error"));

    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send({ email: "error@example.com", password: "123456" });

    expect(res).to.have.status(500);
    expect(res.body).to.have.property("message", "Server error");
    sinon.assert.calledWith(loggerErrorStub, sinon.match.has("error"));
  });
});
