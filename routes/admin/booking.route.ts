import {Router} from "express"
import * as bookingController from "../../controllers/admin/booking.controller"

const router = Router()

router.get("/list", bookingController.bookingList)

export default router