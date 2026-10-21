import {Request, Response} from 'express'
import jwt from "jsonwebtoken"
import { prisma } from '../config/database'

export const check = async (req: Request, res: Response) => {
    try{
        const token = req.cookies.token

        if (!token) {
        return res.status(401).json({
            success: false,
            message: "Chưa đăng nhập hoặc không có token!"
        });
    }

        const decode = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload
        const {id, phoneNumber, role} = decode

        const user = await prisma.user.findFirst({
            where:{
                id: BigInt(id),
                phoneNumber: phoneNumber,
                role: role
            }
        })
        if(!user){
            res.clearCookie("token")
            res.clearCookie("refreshToken")
            res.json({
                success: false,
                message: "Token không hợp lệ!"
            })
            return
        }
        if(user.status === 'SUSPENDED'){
            res.clearCookie("token")
            res.clearCookie("refreshToken")
            res.json({
                success: false,
                message: "Tài khoản đã bị khóa!"
            })
            return
        }
        if(user.role === "CUSTOMER"){
            const customer = await prisma.customerProfile.findUnique({
                where: {
                    userId: user.id
                }
            })
            const infoCustomer = {
                fullName: customer?.fullName,
                avatar: customer?.avatarUrl || "",
                phoneNumber: user.phoneNumber,
                email: user.email || "",
                status: user.status,
                role: user.role
            }
            res.json({
                success: true,
                message: "Token hợp lệ",
                infoCustomer: infoCustomer
            })
            return
        }

        if(user.role === "ADMIN"){
            const admin = await prisma.adminProfile.findUnique({
                where:{
                    userId: user.id
                }
            })
            const infoAdmin = {
                fullName: admin?.fullName,
                avatar: admin?.avatarUrl || "",
                phoneNumber: user.phoneNumber,
                email: user.email || "",
                status: user.status,
                role: user.role
            }
            res.json({
                success: true,
                message: "Token hợp lệ",
                infoAdmin: infoAdmin
            })
            return
        }
        // Bổ sung khi role là "DRIVER" sau



    }catch(error){
        console.log(error)
        res.clearCookie("token");
        return res.status(401).json({
            success: false,
            message: "Token không hợp lệ hoặc đã hết hạn!"
        });
    }

}

export const refreshTokenPost = async (req: Request, res: Response) => {
    try{
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken){
            return res.status(401).json({
                success: false,
                message: "Không tìm thấy Refresh Token!"
            })
        }
        const decode = jwt.verify(refreshToken, `${process.env.JWT_REFRESH_SECRET}`) as jwt.JwtPayload
        const {id, phoneNumber, role} = decode

        const user = await prisma.user.findFirst({
            where: {
                id: BigInt(id),
                phoneNumber: phoneNumber,
                role: role
            }
        })

        if(!user){
            res.clearCookie("refreshToken")
            res.json({
                success: false,
                message: "Refresh Token không hợp lệ!"
            })
            return
        }
        if(user.status === 'SUSPENDED'){
            res.clearCookie("token")
            res.clearCookie("refreshToken")
            res.json({
                success: false,
                message: "Tài khoản đã bị khóa!"
            })
            return
        }

        //Tạo accessToken mới
        const newToken = jwt.sign({
            id: `${user.id}`,
            phoneNumber: user.phoneNumber,
            role: user.role
        },
        `${process.env.JWT_SECRET}`,
        {
            expiresIn: "1h"
        }
        )

        res.cookie("token", newToken, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })
        
        res.json({
            success: true,
            message: "Tạo token mới thành công!"
        })
        
    }catch(error){
        console.log(error)
        res.clearCookie("refreshToken")
        res.json({
            success: false,
            message: "Lỗi hệ thống!"
        })
    }
}

export const logoutPost = async (req: Request, res: Response) => {
    res.clearCookie("token")
    res.clearCookie("refreshToken")
    res.json({
        success: true,
        message: "Đăng xuất thành công!"
    })
}