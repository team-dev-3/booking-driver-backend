import { Router } from "express";
import accountRoutes from "./account.route"
import bookingRoutes from "./booking.route"

const router = Router()

router.use('/account', accountRoutes)
router.use('/booking', bookingRoutes)

export default router