import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import path from "path";
import { fileURLToPath } from "url";


const app = express();
app.use(express.json());
app.use(cors());

const PORT = 8080;

// MongoDb Connection
connectDb();




app.get('/' , (req,res)=>{
    res.send("Backend is running");
})

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})

