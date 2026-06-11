import express from "express"
import cors from "cors"
import routes from "./routes/index.route"
import dotenv from "dotenv"
import { connectDB } from "./config/database"

const app = express()
const port = 8000

//Load biến môi trường từ .env 
dotenv.config()

//Kết nối đến mongoDb
connectDB()

//Cấu hình cors
app.use(cors({
    origin: "*", //có thể diền 1 tên miền
    methods: ["GET", "POST", "PATCH", "DELETE"],  //các phương thức được phép,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

//cho phép gửi data lên dạng json
app.use(express.json())

//thiết lập đường dẫn
app.use("/", routes)

app.listen(port, () => {
    console.log(`website đang chạy trên cổng ${port}`)
})