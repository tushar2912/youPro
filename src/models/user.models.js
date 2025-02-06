import mongoose from "mongoose";
import bcrypt from "bcrypt";

const watchHistoryVideoItemSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
});

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        watchHistory: {
            type: [watchHistoryVideoItemSchema],
            default: [],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true, 
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
        },
        avatar: {
            type: String,
            default: "",
        },
        coverImage: {
            type: String,
            default: "",
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    jwt.sign(
        {
            _id: this.ObjectId,
            email: this.email,
            username: this.userName,
            fullname: this.fullName
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        }        

    )
}

userSchema.methods.refreshAccessToken = function() {
    jwt.sign(
        {
            _id: this.ObjectId,
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        }        

    )
}
const User = mongoose.model("User", userSchema);

export {User};
