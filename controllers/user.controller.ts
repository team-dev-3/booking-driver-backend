import { Request, Response } from "express"
import AccountUser from "../models/account-user.modle"
import bcrypt from "bcryptjs"

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