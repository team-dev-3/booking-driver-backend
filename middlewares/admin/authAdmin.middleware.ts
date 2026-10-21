import jwt, { JwtPayload } from "jsonwebtoken"
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database";
export const verifyTokenUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token
        if(!token){
            res.clearCookie("token")
            res.json({
                code: "error",
                message: "Vui lòng gửi kèm theo token!"
            })
            return
        }

        const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload
        const {id, phoneNumber, role} = decoded

        const user = await prisma.user.findFirst({
            where: {
                id: BigInt(id),
                phoneNumber: phoneNumber,
                role: role
            }
        })
        
        if(!user || user.role !== "ADMIN"){
            res.clearCookie("token")
            res.json({
                code: "error",
                message: "Bạn không có quyền truy cập trang quản trị"
            })
            return
        }
        next()
    } catch (error) {
        res.clearCookie("token")
        res.json({
            code: "error",
            message: "Token không hợp lệ!"
        })
    }
}