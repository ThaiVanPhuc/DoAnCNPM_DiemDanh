const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const Shift = require("../src/models/Shift");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Shift.deleteMany();
});

describe("SHIFT API", () => {
  it("POST /api/shifts - create shift", async () => {
    const res = await request(app).post("/api/shifts").send({
      name: "Ca sáng",
      dayOfWeek: 2,
      startTime: "07:00",
      endTime: "09:00",
      className: "CNTT22A",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Ca sáng");
  });

  it("GET /api/shifts - get all shifts", async () => {
    await Shift.create({
      name: "Ca chiều",
      dayOfWeek: 3,
      startTime: "13:00",
      endTime: "15:00",
    });

    const res = await request(app).get("/api/shifts");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("PUT /api/shifts/:id - update shift", async () => {
    const shift = await Shift.create({
      name: "Ca tối",
      dayOfWeek: 5,
      startTime: "18:00",
      endTime: "20:00",
    });

    const res = await request(app)
      .put(`/api/shifts/${shift._id}`)
      .send({ name: "Ca tối updated" });

    expect(res.body.name).toBe("Ca tối updated");
  });

  it("DELETE /api/shifts/:id - delete shift", async () => {
    const shift = await Shift.create({
      name: "Ca test",
      dayOfWeek: 6,
      startTime: "08:00",
      endTime: "10:00",
    });

    const res = await request(app).delete(`/api/shifts/${shift._id}`);
    expect(res.statusCode).toBe(200);

    const count = await Shift.countDocuments();
    expect(count).toBe(0);
  });
});
