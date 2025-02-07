import { Router } from 'express'
import { loginUser, registerUser } from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { jwtVerify } from '../middlewares/auth.middleware.js'

const router = Router()

router
.route('/register')
.post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }]
    ),
    registerUser
)

router
.route('/login')
.post(jwtVerify, loginUser);

export default router