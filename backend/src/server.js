import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

const app = express();

app.use(helmet()); // adds security headers
app.use(cors()); // lets the React app (on another port) call us
app.use(express.json()); // turns JSON request bodies into req.body

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Level Up API is alive" });
});
app.get("/api/hello/:name", (req, res) => {
  res.json({ greeting: "Hello," + req.params.name });
});

const port = process.env.PORT || 4000;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  app.listen(port, () =>
    console.log(`API running on http://localhost:${port}`),
  );
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  process.exit(1);
}
