import { Request, Response } from "express"
import AccountCompany from "../models/account-company.model"
import bcrypt from "bcryptjs"

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