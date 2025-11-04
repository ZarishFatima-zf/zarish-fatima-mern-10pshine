process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const app = require("../server");
const User = require("../models/User");

const { expect } = chai;

// ✅ Correct plugin use (no parentheses)
chai.use(chaiHttp);

describe("🔐 Forgot & Reset Password APIs", function () {
  let sendMailStub;

  beforeEach(() => {
    // Stub nodemailer to prevent real emails
    sendMailStub = sinon.stub().resolves(true);
    sinon.stub(nodemailer, "createTransport").returns({ sendMail: sendMailStub });
  });

  afterEach(() => {
    sinon.restore();
  });

  // ---------- TEST: Forgot Password ----------
  describe("POST /api/auth/forgot-password", () => {
    it("should send reset email if user exists", async () => {
      const fakeUser = {
        _id: "123",
        email: "test@example.com",
        fullName: "Test User",
        save: sinon.stub().resolves(),
      };

      sinon.stub(User, "findOne").resolves(fakeUser);

      const res = await chai
        .request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Password reset email sent");
      expect(fakeUser.save.calledOnce).to.be.true;
    });

    it("should return 404 if user not found", async () => {
      sinon.stub(User, "findOne").resolves(null);

      const res = await chai
        .request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "notfound@example.com" });

      expect(res).to.have.status(404);
      expect(res.body.message).to.equal("User not found");
    });
  });

  // ---------- TEST: Reset Password ----------
  describe("POST /api/auth/reset-password/:token", () => {
    it("should reset password if valid token", async () => {
      const hashedPassword = await bcrypt.hash("oldpass", 10);
      const fakeUser = {
        _id: "123",
        resetPasswordToken: "validtoken",
        resetPasswordExpire: Date.now() + 10000,
        password: hashedPassword,
        save: sinon.stub().resolves(),
      };

      sinon.stub(User, "findOne").resolves(fakeUser);

      const res = await chai
        .request(app)
        .post("/api/auth/reset-password/validtoken")
        .send({ password: "newpass123" });

      expect(res).to.have.status(200);
      expect(res.body.message).to.equal("Password reset successful");
      expect(fakeUser.save.calledOnce).to.be.true;
    });

    it("should return 400 if token is invalid or expired", async () => {
      sinon.stub(User, "findOne").resolves(null);

      const res = await chai
        .request(app)
        .post("/api/auth/reset-password/invalidtoken")
        .send({ password: "newpass123" });

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("Invalid or expired token");
    });
  });
});
