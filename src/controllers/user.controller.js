import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/ayncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";

const generatingAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.refreshAccessToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: true})
    
    return { accessToken, refreshToken }
}

const registerUser = asyncHandler(async (req,res)=>{
    try {
        const {userName, fullName, email, password} = req.body;

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

const loginUser = asyncHandler(async (req, res) => {
    try {

        console.log("Full Request Body:", req.body);

        if (!req.body) {
            throw new ApiError(400, "Request body is missing");
        }

        const { userName, email, password } = req.body

        console.warn('YOYOYO: ', userName, email, password)

        if (!userName && !email) {
            throw new ApiError(400, 'username or email is required');
        };
        
        const userCredentials = await User.findOne({$or : [{userName: userName},{email: email}]});
        
        if(!userCredentials){
            throw new ApiError(404, "User does not exist")
        }
        
        const passwordStatus =  await userCredentials.isPasswordCorrect(password);

        if (!passwordStatus){
            throw new ApiError(401,"Invalid User Credentials")
        };
        
        const { accessToken, refreshToken } = await generatingAccessAndRefreshToken(userCredentials._id);

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        }

        const loggedInUser = await User.findById(userCredentials._id).select(" -password -refreshtoken")

        res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,accessToken, refreshToken
                },
                "User Has LoggedIn Successfully"
            )
        )

    } catch (error) {
        console.error("Sign in failed:", error);
    }

});

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshAccessToken: ""
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json(
            new ApiResponse(
                200,
                {},
                "User Loggedout Successfully"
            )
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUserDetails = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,
        req.user,
        "current user fetched successfully"
    )
})


const updateAccountDetails = asyncHandler(async(req,res)=>{
    
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
};