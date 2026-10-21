import { Router } from 'express'
import * as adminController from '../../controllers/admin/account.controller'
import * as adminValidate from '../../validates/admin.validate'

const router = Router()

router.post('/login', adminValidate.loginPost, adminController.loginPost)

export default router