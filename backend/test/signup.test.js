process.env.NODE_ENV = "test"; // 👈 use test DB

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const User = require("../models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
chai.should();
chai.use(chaiHttp);

describe("Auth Signup API", () => {

  // Connect to DB before running tests
  before(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear users before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect from DB after all tests
  after(async () => {
    await mongoose.connection.close();
  });

  it("should successfully register a new user", (done) => {
    const email = `test_${Date.now()}@mail.com`;
    const user = {
      fullName: "Test User",
      email,
      password: "password123",
    };

    chai
      .request(server)
      .post("/api/auth/signup")
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property("message").eql("User registered successfully");
        done();
      });
  });

  it("should return 400 if email already exists", (done) => {
    const email = `duplicate_${Date.now()}@mail.com`;
    const user = {
      fullName: "Duplicate User",
      email,
      password: "password123",
    };

    const newUser = new User(user);
    newUser.save().then(() => {
      chai
        .request(server)
        .post("/api/auth/signup")
        .send(user)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("message").eql("Email already registered");
          done();
        });
    });
  });

});
