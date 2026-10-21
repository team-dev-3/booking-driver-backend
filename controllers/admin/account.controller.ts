import type {Response, Request} from 'express'
import {prisma} from "../../config/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const loginPost = async (req: Request, res: Response) => {
    try{
        const {phoneNumber, password} = req.body 

        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: phoneNumber
            }
        })
        if(!user){
            res.json({
                success: false,
                message: "Số điện thoại không tồn tại!"
            })
            return
        }
        if (user.role !== "ADMIN") {
            res.json({
                success: false,
                message: "Tài khoản này không phải là admin!"
            });
            return;
        }
        
        if(user.status === 'SUSPENDED'){
            res.json({
                success: false,
                message: "Tài khoản đã bị khóa!"
            })
            return
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash)
        if(!isValidPassword){
            res.json({
                success: false,
                message: "Mật khẩu không đúng!"
            })
            return
        }

        //Tạo token
        const token = jwt.sign({
            id: `${user.id}`,
            phoneNumber: user.phoneNumber,
            role: user.role
        }, 
        `${process.env.JWT_SECRET}`,
        {
            expiresIn: "1h"
        }
        )

        const refreshToken = jwt.sign({ 
            id: `${user.id}`,
            phoneNumber: user.phoneNumber,
            role: user.role
        },
        `${process.env.JWT_REFRESH_SECRET}`,
        { 
            expiresIn: "7d" 
        }
        )

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        })

        res.json({
            success: true, 
            message: "Đăng nhập thành công!"
        })
    }catch(error){
        console.log(error)
        res.json({
            success: false,
            message: "Lỗi hệ thống!"
        })
    }
}