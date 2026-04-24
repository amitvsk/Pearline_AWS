import mongoose from "mongoose";
import dns from 'dns';

// Set DNS to use Google's DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export const connectDb = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        
        const options = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2,
        };
        
        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log("✅ MongoDB connected successfully");
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });
        
    } catch (error) {
        console.error("❌ Error in connecting database", error.message);
        console.error("Connection string format:", process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));
        
        // Retry connection after 5 seconds
        console.log("Retrying connection in 5 seconds...");
        setTimeout(connectDb, 5000);
    }
};
