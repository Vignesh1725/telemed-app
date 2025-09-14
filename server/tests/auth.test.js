const request = require("supertest");
const app = require("../server"); // ensure you export app from server.js
const mongoose = require("mongoose");

describe("Authentication APIs", () => {
  before(done => {
    mongoose.connect("mongodb://127.0.0.1:27017/telemed360-test").then(() => done());
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.connection.close(done);
    });
  });

  it("should register a new user", done => {
    request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com", password: "pass123", role: "patient" })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it("should reject login with wrong password", done => {
    request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrong" })
      .expect(401, done);
  });
});
