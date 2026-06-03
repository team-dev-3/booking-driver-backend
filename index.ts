import express, { Request, Response } from "express"

const app = express()
const port = 6000

app.get("/", (req: Request, res: Response) => {
    res.send("hello word")
})

app.listen(port, () => {
    console.log(`website đang chạy trên cổng ${port}`)
})