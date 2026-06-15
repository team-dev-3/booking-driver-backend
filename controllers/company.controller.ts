import { Request, Response } from "express"
import AccountCompany from "../models/account-company.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const registerPost = async (req: Request, res: Response) => {
    const {companyName, email, password} = req.body

    const existAccount = await AccountCompany.findOne({
        email: email
    })
    if(existAccount){
        res.json({
            code: "error",
            message: "Email đã tồn tại trong hệ thống!"
        })
        return
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = new AccountCompany({
        companyName: companyName,
        email: email,
        password: hashedPassword
    })

    await newAccount.save()

    res.json({
        code: "success",
        message: "Đăng kí tài khoản thành công!"
    })
}

export const loginPost = async (req: Request, res: Response) => {
    const {email, password} = req.body

    const existAccount = await AccountCompany.findOne({
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

    //Tạo jwt
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
        message: "Đăng nhập thành công!"
    })
}