import { Request, Response } from "express"
import AccountUser from "../models/account-user.modle"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AccountRequest } from "../interface/request.interface"
import CV from "../models/cv.model"
import Job from "../models/job.model"
import AccountCompany from "../models/account-company.model"


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

export const profilePatch = async (req: AccountRequest, res: Response) => {
    if(req.file){
        req.body.avatar = req.file.path
    }else{
        delete req.body.avatar
    }

    await AccountUser.updateOne({
        _id: req.account.id
    }, req.body)

    res.json({
        code: "success",
        message: "Cập nhật thành công!"
    })
}

export const cvList = async (req: AccountRequest, res: Response) => {
    const userId = req.account.id
    const infoUser = await AccountUser.findOne({
        _id: userId
    })
    const cvList = await CV.find({
        email: infoUser?.email
    })
    if(!cvList){
        res.json({
            code: "error",
            message: "Thất bại!"
        })
        return
    }
    const jobList = await Job.find({})
    const jobHashMap: any = {}
    for(const item of jobList){
        jobHashMap[item.id] = item
    }

    const companyList = await AccountCompany.find({})
    const companyHashMap: any = {}
    for(const item of companyList){
        companyHashMap[item.id] = item
    }

    const dataCVList = []
    for(const item of cvList){
        const dataCV = {
            id: item.id,
            jobTitle: "",
            companyName: "",
            salaryMin: "",
            salaryMax: "",
            position: "",
            workingForm: "",
            status: item.status
        }
        dataCV.jobTitle = jobHashMap[`${item.jobId}`].title
        dataCV.companyName = companyHashMap[jobHashMap[`${item.jobId}`].companyId].companyName
        dataCV.salaryMin = jobHashMap[`${item.jobId}`].salaryMin
        dataCV.salaryMax = jobHashMap[`${item.jobId}`].salaryMax
        dataCV.position = jobHashMap[`${item.jobId}`].position
        dataCV.workingForm = jobHashMap[`${item.jobId}`].workingForm

        dataCVList.push(dataCV)
    }
    res.json({
        code: "success",
        message: "Thành công!",
        dataFinal: dataCVList
    })
}