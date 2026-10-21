import { Router } from 'express'
import * as customerController from "../../controllers/customer/account.controller"
import * as authController from "../../controllers/auth.controller"
import * as customerValidate from "../../validates/customer.validate"

const router = Router()

router.post('/register', customerValidate.registerPost, customerController.registerPost)
router.post('/login', customerValidate.loginPost, customerController.loginPost)
router.post('/logout', authController.logoutPost)

export default router