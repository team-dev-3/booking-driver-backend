import { Router } from "express";
import accountRoutes from "./account.route"

const router = Router()

router.use('/account', accountRoutes)


export default router