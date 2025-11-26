
// import express from "express";
// import multer from "multer";
// import { uploadBanners, getBanners } from "../../controller/admin/homeBannerController.js";

// const homeBannerRouter = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// homeBannerRouter.post(
//   "/upload",
//   upload.fields([
//     { name: "banner1", maxCount: 1 },
//     { name: "banner2", maxCount: 1 },
//     { name: "banner3", maxCount: 1 }
//   ]),
//   uploadBanners
// );

// homeBannerRouter.get("/banners", getBanners);

// export default homeBannerRouter;


import express from "express";
import multer from "multer";
import { 
  uploadBanners, 
  getBanners, 
  getBannerById, 
  updateBanner, 
  deleteBanner 
} from "../../controller/admin/homeBannerController.js";

const homeBannerRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// homeBannerRouter.post(
//   "/upload",
//   upload.fields([
//     { name: "banner1", maxCount: 1 },
//     { name: "banner2", maxCount: 1 },
//     { name: "banner3", maxCount: 1 }
//   ]),
//   uploadBanners
// );

// homeBannerRouter.get("/banners", getBanners);
// homeBannerRouter.get("/:id", getBannerById);

// homeBannerRouter.put(
//   "/:id",
//   upload.fields([
//     { name: "banner1", maxCount: 1 },
//     { name: "banner2", maxCount: 1 },
//     { name: "banner3", maxCount: 1 }
//   ]),
//   updateBanner
// );

// homeBannerRouter.delete("/:id", deleteBanner);

// export default homeBannerRouter;









homeBannerRouter.post(
  "/upload",
  upload.fields([
    { name: "banner1", maxCount: 1 },
    { name: "banner2", maxCount: 1 },
    { name: "banner3", maxCount: 1 },
    { name: "mob_banner1", maxCount: 1 },
    { name: "mob_banner2", maxCount: 1 },
    { name: "mob_banner3", maxCount: 1 }
  ]),
  uploadBanners
);

// Get latest banners
homeBannerRouter.get("/banners", getBanners);

// Get banner by ID
homeBannerRouter.get("/:id", getBannerById);

// Update banner (any combination of images can be updated)
homeBannerRouter.put(
  "/:id",
  upload.fields([
    { name: "banner1", maxCount: 1 },
    { name: "banner2", maxCount: 1 },
    { name: "banner3", maxCount: 1 },
    { name: "mob_banner1", maxCount: 1 },
    { name: "mob_banner2", maxCount: 1 },
    { name: "mob_banner3", maxCount: 1 }
  ]),
  updateBanner
);

// Delete banner
homeBannerRouter.delete("/:id", deleteBanner);

export default homeBannerRouter;