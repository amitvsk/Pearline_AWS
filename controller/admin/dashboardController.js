import Order from '../../model/user/Order.js';
import Product from '../../model/admin/productModel.js';
import User from '../../model/user/userModel.js';
import mongoose from 'mongoose';

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Total Revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const lastMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'Delivered',
          createdAt: { $gte: lastMonth, $lt: currentMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const currentRevenue = totalRevenue[0]?.total || 0;
    const prevRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;

    // Total Orders
    const totalOrders = await Order.countDocuments();
    const lastMonthOrders = await Order.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth }
    });
    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    const ordersChange = lastMonthOrders > 0 ? ((currentMonthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 0;

    // Total Products
    const totalProducts = await Product.countDocuments();
    const newProductsThisMonth = await Product.countDocuments({
      createdAt: { $gte: currentMonth }
    });

    // Total Customers
    const totalCustomers = await User.countDocuments();
    const lastMonthCustomers = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lt: currentMonth }
    });
    const currentMonthCustomers = await User.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    const customersChange = lastMonthCustomers > 0 ? ((currentMonthCustomers - lastMonthCustomers) / lastMonthCustomers * 100).toFixed(1) : 0;

    const stats = [
      {
        title: "Total Revenue",
        value: `₹${currentRevenue.toLocaleString('en-IN')}`,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}% from last month`,
        color: "text-[#9C1137]",
        bgColor: "bg-[#9C1137]/10"
      },
      {
        title: "Total Orders",
        value: totalOrders.toLocaleString('en-IN'),
        change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}% from last month`,
        color: "text-[#9C1137]",
        bgColor: "bg-[#9C1137]/10"
      },
      {
        title: "Products",
        value: totalProducts.toLocaleString('en-IN'),
        change: `+${newProductsThisMonth} new this month`,
        color: "text-[#7d0e2a]",
        bgColor: "bg-[#7d0e2a]/10"
      },
      {
        title: "Customers",
        value: totalCustomers.toLocaleString('en-IN'),
        change: `${customersChange >= 0 ? '+' : ''}${customersChange}% from last month`,
        color: "text-[#9C1137]",
        bgColor: "bg-[#9C1137]/10"
      }
    ];

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get sales data for chart
const getSalesData = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          sales: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedData = salesData.map(item => ({
      month: monthNames[item._id.month - 1],
      sales: item.sales
    }));

    res.json({ success: true, salesData: formattedData });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get category distribution
const getCategoryData = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const formattedCategories = categories.map(cat => ({
      name: cat._id || 'Uncategorized',
      value: cat.value
    }));

    res.json({ success: true, categories: formattedCategories });
  } catch (error) {
    console.error('Error fetching category data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(2);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(2);

    const activities = [];

    // Add order activities
    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order._id}`,
        type: 'order',
        message: `New order #${order._id.toString().slice(-4)} placed by ${order.user?.name || 'Customer'}`,
        timestamp: order.createdAt,
        color: 'text-[#9C1137]',
        bgColor: 'bg-[#9C1137]/10'
      });
    });

    // Add product activities
    recentProducts.forEach(product => {
      activities.push({
        id: `product-${product._id}`,
        type: 'product',
        message: `${product.name} added to inventory`,
        timestamp: product.createdAt,
        color: 'text-[#7d0e2a]',
        bgColor: 'bg-[#7d0e2a]/10'
      });
    });

    // Add user activities
    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        type: 'user',
        message: `New customer registration - ${user.name}`,
        timestamp: user.createdAt,
        color: 'text-[#9C1137]',
        bgColor: 'bg-[#9C1137]/10'
      });
    });

    // Sort by timestamp and limit to 5
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, 5);

    res.json({ success: true, activities: limitedActivities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get top products
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSales: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$total'] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    const formattedProducts = topProducts.map((item, index) => ({
      id: item._id,
      name: item.product.name,
      sales: item.totalSales,
      revenue: item.totalRevenue,
      image: getProductEmoji(item.product.category),
      trend: `+${(Math.random() * 20 + 5).toFixed(0)}%` // Random trend for now
    }));

    res.json({ success: true, products: formattedProducts });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get weekly performance data
const getWeeklyData = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyData = await Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const formattedData = [];

    for (let i = 1; i <= 7; i++) {
      const dayData = weeklyData.find(d => d._id === i);
      formattedData.push({
        day: dayNames[i - 1],
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0
      });
    }

    res.json({ success: true, weeklyData: formattedData });
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get quick stats
const getQuickStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Page views (mock data - you'd need analytics integration)
    const pageViews = {
      value: Math.floor(Math.random() * 2000 + 1000).toLocaleString('en-IN'),
      change: `+${Math.floor(Math.random() * 30 + 5)}%`
    };

    // Average rating (mock calculation)
    const avgRating = {
      value: (4.5 + Math.random() * 0.5).toFixed(1),
      change: `+${(Math.random() * 0.5).toFixed(1)}`
    };

    // Low stock items
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });
    const lowStock = {
      value: lowStockCount.toString(),
      status: lowStockCount > 20 ? 'warning' : 'good'
    };

    const quickStats = {
      pageViews,
      avgRating,
      lowStock
    };

    res.json({ success: true, quickStats });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to get emoji based on category
const getProductEmoji = (category) => {
  const emojiMap = {
    'rings': '💍',
    'necklaces': '📿',
    'earrings': '👂',
    'bracelets': '⚡',
    'pendants': '🔸',
    'chains': '🔗'
  };
  return emojiMap[category?.toLowerCase()] || '💎';
};

export {
  getDashboardStats,
  getSalesData,
  getCategoryData,
  getRecentActivities,
  getTopProducts,
  getWeeklyData,
  getQuickStats
};