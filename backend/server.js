import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/DB.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();


const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


