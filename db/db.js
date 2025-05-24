import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

const db = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Optional: Ping the database to verify connection
        await mongoose.connection.db.command({ ping: 1 });
        console.log('Db Connected');
    } catch (error) {
        console.log(`MongoDB connection error: ${error}`);
    }
};

export default db;