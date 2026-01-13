import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import lessonRoutes from "./routes/lessons.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SignAge backend running 🚀");
});
app.use("/lessons", lessonRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
