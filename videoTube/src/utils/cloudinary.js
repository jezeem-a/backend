import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config()

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    const response = await cloudinary.uploader.upload(
      localFilePath, {
        resource_type: "auto"
      }
    );
    console.log("File uploaded in cloudinary. Src:" + response.url);
    // once file is uploaded delete it from the server
    fs.unlinkSync(localFilePath);
    return response
  } catch (error) {
    console.log("cloudinary error", error)
    fs.unlinkSync(localFilePath)
    return null;
  }
}

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("deleted from cloudinary, id", publicId);
  } catch (error) {
    console.log("error deleting from cloudinary:", error);
    return null;
  }
}

export {uploadOnCloudinary, deleteFromCloudinary}
