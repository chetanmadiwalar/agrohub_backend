import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URL = process.env.MONGO_URL

const db = async () => {
    try {
        mongoose.set('strictQuery', false)
        await mongoose.connect(MONGO_URL)
        console.log('Db Connected')
    } catch (error) {
        console.log(`${error}`);
    }
}

export default db;