# Local Storage Migration Guide

## ✅ What's Done:
1. Created `utils/localStorage.js` with helper functions
2. Updated `homeBannerController.js` to use local storage
3. Added static file serving in `index.js`
4. Updated `.env` with BASE_URL

## 📝 How Images Work Now:

### Upload Flow:
1. Admin uploads image via frontend
2. Backend saves to `Pearline_AWS/uploads/` folder
3. Database stores relative path: `/uploads/filename.png`
4. API returns full URL: `http://localhost:8000/uploads/filename.png`

### Display Flow:
1. Frontend fetches data from API
2. Gets full image URL
3. Displays image using `<img src={fullUrl} />`

## 🔧 Controllers Already Updated:
- ✅ homeBannerController.js

## 📋 Controllers That Need Update:
- aboutBannerController.js
- aboutController.js
- arrivalBannerController.js
- articleController.js
- collectionBannerController.js
- collectionController.js
- homeArrivalController.js
- homebanner2Controller.js
- offerBannerController.js
- offerController.js
- productController.js (already commented, needs new implementation)
- shopallBannerController.js
- testimonialController.js
- valuesController.js

## 🚀 To Update a Controller:

### Step 1: Replace imports
```javascript
// OLD:
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// NEW:
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";
```

### Step 2: Replace upload function
```javascript
// OLD:
const imageUrl = await uploadToS3(req.file);

// NEW:
const imageUrl = await saveToLocal(req.file);
```

### Step 3: Replace delete function
```javascript
// OLD:
await deleteFromS3(banner.image);

// NEW:
await deleteFromLocal(banner.image);
```

### Step 4: Convert URLs in GET endpoints
```javascript
// In GET endpoints, convert relative URLs to full URLs:
const banner = await BannerModel.findOne();
if (banner && banner.image) {
  banner.image = toFullUrl(banner.image);
}
res.json(banner);
```

## 🎯 Quick Fix for All Images:

Run backend with:
```bash
cd Pearline_AWS
npm start
```

Images will be served from:
```
http://localhost:8000/uploads/
```

## 📁 Folder Structure:
```
Pearline_AWS/
├── uploads/           # All uploaded images stored here
│   ├── uuid-1.png
│   ├── uuid-2.jpg
│   └── ...
├── utils/
│   └── localStorage.js  # Helper functions
└── controller/
    └── admin/
        └── *.js        # Controllers using localStorage
```

## ⚠️ Important Notes:
1. Make sure `uploads/` folder exists (auto-created by localStorage.js)
2. Add `uploads/` to `.gitignore` if not already there
3. For production, consider using a CDN or cloud storage
4. Backup `uploads/` folder regularly
