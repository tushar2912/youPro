import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

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
        console.log("File has been uploaded successfully!!!",response.url);
        return response
    } catch (error) {
        fs.unlink(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary}