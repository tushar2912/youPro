const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        require: true,
        unique: true,
        lower: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lower: true
    },
    password: {
        type: String,
        require: true,
    }
},{
    timestamps: true
})


export default User = mongoose.model('User', userSchema)