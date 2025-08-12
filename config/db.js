import mongoose from "mongoose";
import 'dotenv/config'

export const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("mongoDB connected")
    } catch (error) {
        console.error("Error in connecting database" , error)
    }
}