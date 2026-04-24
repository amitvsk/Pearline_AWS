# MulterError: Unexpected Field - Fix Guide

## Error:
```
MulterError: Unexpected field
```

## Root Cause:
Frontend is sending field names that don't match what Multer expects in the backend route configuration.

## Expected Field Names (Backend):
```javascript
// Desktop banners
banner1, banner2, banner3

// Mobile banners
mob_banner1, mob_banner2, mob_banner3
```

## Fix Applied:

### Frontend (AdminBanner.jsx):
Added strict validation to ensure ONLY File objects are appended:
```javascript
// Before
if (form[`image${i}`] instanceof File) {
  formData.append(`banner${i}`, form[`image${i}`]);
}

// After (with extra checks)
const imageField = form[`image${i}`];
if (imageField && imageField instanceof File) {
  formData.append(`banner${i}`, imageField);
  console.log(`Appending banner${i}:`, imageField.name);
}
```

### Added Debug Logging:
Console logs to see exactly what's being sent:
```javascript
console.log("FormData entries:");
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
```

## How to Debug:

### Step 1: Check Browser Console
After clicking "Upload Banners", check console for:
```
Appending banner1: image1.jpg
Appending banner2: image2.jpg
Appending banner3: image3.jpg
Appending mob_banner1: mobile1.jpg
Appending mob_banner2: mobile2.jpg
Appending mob_banner3: mobile3.jpg
FormData entries:
banner1 [File object]
banner2 [File object]
...
```

### Step 2: Check Backend Logs
Look for the MulterError and see which field is unexpected.

### Step 3: Verify Field Names Match
Ensure frontend sends exactly what backend expects:
- ✅ `banner1` → `banner1`
- ✅ `mob_banner1` → `mob_banner1`
- ❌ `image1` → Wrong!
- ❌ `mobImage1` → Wrong!

## Common Causes:

1. **Wrong field names** - Frontend using different names than backend
2. **Extra fields** - Sending additional data that Multer doesn't expect
3. **Non-File data** - Sending strings/objects instead of File objects
4. **Duplicate fields** - Same field name sent multiple times

## Backend Route Configuration:
```javascript
// routes/admin/homeBannerRoute.js
upload.fields([
  { name: "banner1", maxCount: 1 },
  { name: "banner2", maxCount: 1 },
  { name: "banner3", maxCount: 1 },
  { name: "mob_banner1", maxCount: 1 },
  { name: "mob_banner2", maxCount: 1 },
  { name: "mob_banner3", maxCount: 1 }
])
```

## Testing Steps:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart dev server** (npm run dev)
3. **Open Admin Banner page**
4. **Select all 6 images** (3 desktop + 3 mobile)
5. **Click "Upload Banners"**
6. **Check console logs** for field names
7. **Verify no MulterError** in backend logs

## Expected Behavior:
- ✅ All 6 images uploaded successfully
- ✅ No MulterError in backend
- ✅ Console shows correct field names
- ✅ Banner data saved to database

## If Error Persists:

### Check these:
1. Are you selecting actual image files?
2. Are all 6 images selected before submitting?
3. Is the form state properly set?
4. Are there any other form fields being sent?

### Debug Commands:
```javascript
// In handleSubmit, before formData creation:
console.log("Form state:", form);
console.log("Image1:", form.image1);
console.log("Is File?", form.image1 instanceof File);
```

## Status:
🟡 **DEBUGGING** - Console logs added to identify the issue
