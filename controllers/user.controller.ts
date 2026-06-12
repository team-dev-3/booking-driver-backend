import { Request, Response } from "express"
import AccountUser from "../models/account-user.modle"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const RegisterPost = async (req: Request, res: Response) => {
    const {fullName, email, password} = req.body
    
    const existAccount = await AccountUser.findOne({
        email: email
    })
    if(existAccount){
        res.json({
            code: "error",
            message: "Email đã tồn tại trong hệ thống!"
        })
        return
    }

    //Mã hóa mật khẩu cói bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = new AccountUser({
        fullName: fullName,
        email: email,
        password: hashedPassword
    })

    await newAccount.save()
    res.json({
        code: "success",
        message: "Đăng kí tài khoản thành công"
    })
}

export const LoginPost = async (req: Request, res: Response) => {
    const {email, password} = req.body

    const existAccount = await AccountUser.findOne({
        email: email
    })

    if(!existAccount){
        res.json({
            code: "error",
            message: "Email không tồn tại trong hệ thống!"
        })
        return
    }

    //Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`)
    if(!isPasswordValid){
        res.json({
            code: "error",
            message: "Mật khẩu không đúng!"
        })
        return
    }

    // Tạo jwt
    const token = jwt.sign(
        {
            id: existAccount.id,
            email: existAccount.email
        },
        `${process.env.JWT_SECRET}`,
        {
            expiresIn: '1d'
        }
    )

    //Lưu token vào cookie
    res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax", //Cho phép cookie gửi giữa các miền 
        secure: process.env.NODE_ENV === "production" //true: web có https, false: web không có https(có http)
    })

    res.json({
        code: "success",
        message: "Đăng nhập thành công"
    })
}