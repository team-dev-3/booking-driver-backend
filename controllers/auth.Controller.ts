import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import AccountUser from "../models/account-user.modle"
import AccountCompany from "../models/account-company.model"

export const check = async (req: Request, res: Response) => {
    try{
        const token = req.cookies.token
        if(!token){
            res.json({
                code: "error",
                message: "Token không hợp lệ!"
            })
            return
        }
        const decode = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload
        const {id, email} = decode

        //Tìm user
        const existAccountUser = await AccountUser.findOne({
            _id: id,
            email: email
        })
        if(existAccountUser){
            const infoUser = {
                id: existAccountUser.id,
                email: existAccountUser.email,
                fullName: existAccountUser.fullName
            }
            res.json({
                code: "success",
                message: "Token hợp lệ!",
                infoUser: infoUser
            })
            return
        }

        //Tìm company
        const existAccountCompany = await AccountCompany.findOne({
            _id: id,
            email: email
        })
        if(existAccountCompany){
            const infoCompany = {
                id: existAccountCompany.id,
                companyName: existAccountCompany.companyName,
                email: existAccountCompany.email,
            }
            res.json({
                code: "success",
                message: "Token hợp lệ!",
                infoCompany: infoCompany
            })
            return
        }

        if(!existAccountUser && !existAccountCompany){
            res.clearCookie("token"),
            res.json({
                code: "error",
                message: "Token không hợp lệ!"
            })
            return
        }
        
    }catch(error){
        res.clearCookie("token")
        res.json({
            code: "error",
            message: "Token không hợp lệ!"
        })
        return
    }
}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("token")
    res.json({
        code: "success",
        message: "Đã đăng xuất!"
    })
}