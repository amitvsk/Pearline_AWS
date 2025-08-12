import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import path from "path";
import { fileURLToPath } from "url"; // ✅ Required for __dirname in ESM
import userRouter from './routes/user/userRoute.js';
import adminRouter from './routes/admin/adminRoute.js';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 8080;

// MongoDB Connection
connectDb();

app.use("/user", userRouter);
app.use("/admin", adminRouter);

// ✅ Fix for __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'build'))); // Change 'build' if needed

// Redirect all requests to index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
