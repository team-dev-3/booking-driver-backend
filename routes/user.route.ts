import { Router } from "express"
import * as userController from "../controllers/user.controller"
import * as userValidate from "../validates/user.validate"
import * as authMiddleware from "../middlewares/auth.middleware"
import multer from "multer"
import { storage } from "../helpers/cloudinary.helper"

const router = Router()

const upload = multer({
    storage: storage
})

router.post("/register", userValidate.registerPost, userController.RegisterPost)

router.post("/login", userValidate.loginPost, userController.LoginPost)

router.patch("/profile", authMiddleware.verifyTokenUser as any, upload.single("avatar"), userValidate.profilePatch, userController.profilePatch)

export default router