import { Router } from "express";
import * as companyController from "../controllers/company.controller"
import * as companyValidate from "../validates/company.validate"
import * as authMiddleWare from "../middlewares/auth.middleware"
import multer from "multer"
import { storage } from "../helpers/cloudinary.helper"

const upload = multer({
    storage: storage
})

const router = Router()

router.post("/register", companyValidate.registerPost, companyController.registerPost)

router.post("/login", companyValidate.loginPost, companyController.loginPost)

router.patch("/profile", authMiddleWare.verifyTokenCompany, upload.single("logo"), companyController.profilePatch)

export default router