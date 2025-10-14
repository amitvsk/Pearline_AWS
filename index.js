import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import path from "path";
import { fileURLToPath } from "url"; // ✅ Required for __dirname in ESM
import userRouter from './routes/user/userRoute.js';
import adminRouter from './routes/admin/adminRoute.js';
import bannerRouter from './routes/admin/homeBannerRoute.js';
import aboutBannerRouter from './routes/admin/aboutBannerRoutes.js';
import arrivalBannerRouter from './routes/admin/arrivalBannerRoutes.js';
import shopallBannerRouter from './routes/admin/shopallBannerRoutes.js';
import collectionBannerRouter from './routes/admin/collectionBannerRoutes.js';
import blogRouter from './routes/admin/articleRoute.js';
import valuesRouter from "./routes/admin/valuesRoute.js";
import messageRouter from "./routes/admin/messageRoute.js";
import faqRouter from "./routes/admin/faqRoute.js";
import addressRouter from "./routes/admin/addressRoute.js";
import servicesRouter from "./routes/admin/servicesRoute.js";
import aboutRouter from './routes/admin/aboutRoutes.js';
import testimonialRouter from './routes/admin/testimonialRoutes.js';
import productRouter from './routes/admin/productRoutes.js';
import wishlistRouter from "./routes/user/wishlistRoutes.js";
import cartRouter from "./routes/user/cartRoutes.js";
import couponRouter from "./routes/admin/couponRoutes.js";
import orderRouter from "./routes/user/orderRoutes.js";
import collectionRouter from "./routes/admin/collectionRoutes.js";
import shippingSalesRouter from "./routes/admin/shippingSalesRoutes.js";
import offerRouter from "./routes/admin/offerRoutes.js";
import homebanner2Router from "./routes/admin/homebanner2Routes.js";
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 8080;

// MongoDB Connection
connectDb();

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/banner", bannerRouter);
app.use("/about/banner", aboutBannerRouter);
app.use("/arrival/banner", arrivalBannerRouter);
app.use("/shopall/banner", shopallBannerRouter);
app.use("/collection/banner", collectionBannerRouter);
app.use("/blog", blogRouter);
app.use("/values", valuesRouter);
app.use("/messages", messageRouter);
app.use("/faqs", faqRouter);
app.use("/addresses", addressRouter);
app.use("/services", servicesRouter);
app.use("/about", aboutRouter);
app.use("/testimonial", testimonialRouter);
app.use("/product", productRouter);
app.use("/wishlist", wishlistRouter);
app.use("/cart", cartRouter);
app.use("/coupons", couponRouter);
app.use("/order", orderRouter);
app.use("/collection", collectionRouter);
app.use("/shipping" , shippingSalesRouter);
app.use("/offer" , offerRouter);
app.use("/homebanner2" , homebanner2Router);
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
