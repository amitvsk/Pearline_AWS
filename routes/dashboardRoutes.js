import express from 'express';
const router = express.Router();
import {
  getDashboardStats,
  getSalesData,
  getCategoryData,
  getRecentActivities,
  getTopProducts,
  getWeeklyData,
  getQuickStats
} from '../controller/admin/dashboardController.js';

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Dashboard routes are working!' });
});

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/sales', getSalesData);
router.get('/categories', getCategoryData);
router.get('/activities', getRecentActivities);
router.get('/top-products', getTopProducts);
router.get('/weekly', getWeeklyData);
router.get('/quick-stats', getQuickStats);

export default router;