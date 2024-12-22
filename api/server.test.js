const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const authRoutes = require("../api/auth/auth-router");
const jokesRouter = require("../api/jokes/jokes-router");
const jwt = require("jsonwebtoken");
const restrict = require("../api/middleware/restricted");

// const app = express();
// app.use(express.json());
// app.use("/api/auth", authRoutes);
const db = require("../data/dbConfig");

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));

console.log(jwt.sign);

beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
});
afterEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
});
afterAll(async () => {
    await db.destroy();
});

// --- AUTH REGISTER TESTS
describe("Auth API Endpoints: Register", () => {
    let app;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/api/auth", authRoutes);
    });

    it("[0] should register a new user with a hashed password", async () => {
        const userData = {
            username: "testuser",
            password: "password123",
        };

        const response = await request(app).post("/api/auth/register").send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("username", userData.username);
        expect(response.body).toHaveProperty("password");
        expect(response.body.password).not.toBe(userData.password); // Ensure password is hashed

        const userInDb = await db("users").where({ username: userData.username }).first();
        expect(userInDb).toBeDefined();
        expect(await bcrypt.compare(userData.password, userInDb.password)).toBe(true); // Ensure passwords match
    });

    it("[1] should return 400 if username is missing", async () => {
        const userData = {
            password: "password123",
        };

        const response = await request(app).post("/api/auth/register").send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message");
    });
});

// --- AUTH LOGIN TESTS
describe("Auth API Endpoints: Login", () => {
    let app;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/api/auth", authRoutes);
    });

    it("[0] should login successfully and return a token", async () => {
        // Prepare mock user
        const user = {
            id: 1,
            username: "testuser",
            password: "password123",
        };

        // Mock jwt.sign to return a sample token
        jwt.sign.mockReturnValue("mocked_token");

        // Mock database setup
        await db("users").insert({
            id: user.id,
            username: user.username,
            password: "hashed_password", // Assume hashed password exists
        });

        // Simulate login
        const response = await request(app)
            .post("/api/auth/login")
            .send({ username: user.username, password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", `welcome, ${user.username}`);
        expect(response.body).toHaveProperty("token", "mocked_token");

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: user.id, username: user.username, password: "hashed_password" },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );
    });

    it("[1] should return 401 if user does not exist", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ username: "nonexistent", password: "password123" });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
    });
});

// --- JOKES TESTS
// app.use("/api/jokes",jokesRouter);
describe("GET /api/jokes (Restricted Access)", () => {
    let app;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/api/jokes", restrict, jokesRouter); // Apply 'restrict' only here
    });

    it("[0] should return status 401 if no token is provided", async () => {
        const response = await request(app).get("/api/jokes");

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "token required");
    });
    it('should check if the Authorization header exists', async () => {
      const response = await request(app)
          .get('/api/jokes')
          .set('Authorization', ''); // Empty Authorization header

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'token required');
  });

});
// test("sanity", () => {
//     expect(true).toBe(true);
// });
