import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLODINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(
            localFilePath,{
                resource_type: "auto"
            }
        );
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlink(localFilePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log("File deleted successfully.");
            }
          });
        return null;
    }
}

export {uploadOnCloudinary}