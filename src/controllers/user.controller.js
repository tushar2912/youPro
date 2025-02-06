import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    try {
        const {userName, fullName, email, password} = req.body;
        console.log(`userName: ${userName},\n fullName: ${fullName},\n email: ${email},\n password: ${password}`)

        if ([userName, fullName, email, password].some((field) => field?.trim()==="")){
            throw new ApiError(400,'All fields are required')
        }

        const existedUser = await User.findOne({
            $or: [{userName},{email}]
        })

        if (existedUser){
            throw new ApiError(409,"Username or Email already exists")
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar File is required")
        };

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar?.url){
            throw new ApiError(400,"Avatar File is required to upload")
        }

        const user = await User.create({
            userName : userName.toLowerCase(),
            fullName,
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser){
            throw new ApiError(500,"Something went wrong. Please try again later")
        }
        
        res.status(201).json(
            new ApiResponse(201, createdUser, "user registered successfully!!!")
        )
    } catch (error) {
        console.error("ERROR OCCURRED:", error);
        return res.status(error.statusCode || 500).json(
            new ApiError(error.statusCode || 500, error.message || "Internal Server Error")
        );
    }
})

export {registerUser};