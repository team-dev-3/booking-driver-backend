import {Router} from 'express'
import * as authController from "../controllers/auth.controller"

const router = Router()

router.get("/check", authController.check)

router.post('/logout', authController.logoutPost)

router.post('/refresh-token', authController.refreshTokenPost)

export default router