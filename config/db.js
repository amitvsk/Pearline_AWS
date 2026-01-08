import mongoose from "mongoose";
import 'dotenv/config'

export const connectDb = async () =>{
    try {
        console.log("Attempting to connect to MongoDB with URI:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("mongoDB connected successfully")
    } catch (error) {
        console.error("Error in connecting database" , error)
    }
}