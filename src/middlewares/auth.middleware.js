import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken";

export const jwtVerify = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
    
        if (!token){
            throw new ApiError(401,"Unaunthorized Request")
        }
    
        const decodedToken = jwt.verify(token,process.env.AccessBackend);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken");
    
        if(!user){
            throw new ApiError(404, "User Not Found")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})