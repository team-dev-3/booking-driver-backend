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

router.post("/job/create",
        authMiddleWare.verifyTokenCompany, 
        upload.array("images", 8), 
        companyController.createJobPost)

router.get("/job/list", authMiddleWare.verifyTokenCompany, companyController.listJob)

router.get("/job/edit/:id", authMiddleWare.verifyTokenCompany, companyController.editJob)

router.patch("/job/edit/:id", authMiddleWare.verifyTokenCompany, upload.array("images", 8), companyController.editJobPatch)

router.delete("/job/delete/:id", authMiddleWare.verifyTokenCompany, companyController.deleteJobDel)

router.get("/list", companyController.list)

router.get("/detail/:id", companyController.detail)

router.get("/cv/list", authMiddleWare.verifyTokenCompany,companyController.cvList)

router.get("/cv/detail/:id", authMiddleWare.verifyTokenCompany, companyController.detailCV)

router.patch("/cv/change-status", authMiddleWare.verifyTokenCompany, companyController.changeCVStatusPatch)

export default router