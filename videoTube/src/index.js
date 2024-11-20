import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';

// declare port
// const PORT = 8001
// full job of the index file is to make listen to port

dotenv.config({
  path: './.env'
})

const PORT = process.env.PORT || 8001

connectDB()
.then(() => {
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})
})
.catch((err) => {
  console.log("Mongo db connection error")
})