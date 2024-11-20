 import mongoose from 'mongoose';
 import { DB_NAME } from '../constants.js';

//  connect DB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n MDB connected ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("DB connection error", error);
    process.exit(1);
  }
}

export default connectDB