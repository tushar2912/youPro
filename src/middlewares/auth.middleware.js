import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const jwtVerify = asyncHandler(async (req, _, next) => {
    try {
        console.log("Headers:", req.headers);
        console.log("Cookies:", req.cookies);

        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
        
        console.log("Extracted Token:", token);


    
        if (!token){
            throw new ApiError(401,"Unaunthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(404, "User Not Found")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})