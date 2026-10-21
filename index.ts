import express from "express"
import cors from "cors"
import customerRoutes from "./routes/customer/index.route"
import adminRoutes from "./routes/admin/index.route"
import authRoutes from "./routes/auth.route"
import {pathAdmin} from "./config/variable"
import dotenv from "dotenv"
import { connectDB } from "./config/database"
import cookieParser from "cookie-parser"

const app = express()
const port = 8000

//Load biến môi trường từ .env 
dotenv.config()

//Kết nối đến mongoDb
connectDB()

//Cấu hình cors
app.use(cors({
    origin: "http://localhost:3000", //phải diền 1 tên miền cụ thể
    credentials: true, //Cho phép gửi cookie
    methods: ["GET", "POST", "PATCH", "DELETE"],  //các phương thức được phép,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//cho phép gửi data lên dạng json
app.use(express.json())

//cấu hình cho phép lấy được cookie
app.use(cookieParser())

//thiết lập đường dẫn
app.use("/customer", customerRoutes)
app.use(`/${pathAdmin}`, adminRoutes)
app.use('/auth', authRoutes)

app.listen(port, () => {
    console.log(`website đang chạy trên cổng ${port}`)
})