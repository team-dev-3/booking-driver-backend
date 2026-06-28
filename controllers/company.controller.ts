import { Request, Response } from "express"
import AccountCompany from "../models/account-company.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AccountRequest } from "../interface/request.interface"
import { parse } from "node:path"
import Job from "../models/job.model"
import City from "../models/city.model"

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

export const profilePatch = async (req: AccountRequest, res: Response) => {
    if(req.file){
        req.body.logo = req.file.path
    }else{
        delete req.body.logo
    }

    await AccountCompany.updateOne({
        _id: req.account.id
    }, req.body)

    res.json({
        code: "success",
        message: "Cập nhật thành công!"
    })
}

export const createJobPost = async (req: AccountRequest, res: Response) => {
    req.body.companyId = req.account.id
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0
    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : []
    req.body.images = []
    if(req.files){
        for(const item of req.files as any[]){
            req.body.images.push(item)
        }
    }

    const newRecord = new Job(req.body)
    await newRecord.save()

    res.json({
        code: "success",
        message: "Tạo công việc thành công!"
    })
}

export const listJob = async(req: AccountRequest, res: Response) => {
    const listJob = await Job.find({
        companyId: req.account.id
    })
    const city = await City.findOne({
        _id: req.account.city
    })

    const dataFinal = []
    for(const item of listJob){
        dataFinal.push({
            id: item.id,
            companyLogo: req.account.logo,
            title: item.title,
            companyName: req.account.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            position: item.position,
            workingForm: item.workingForm,
            companyCity: city?.name,
            technologies: item.technologies
        })
    }
    res.json({
        code: "success",
        message: "Lấy danh sách công việc thành công!",
        jobs: dataFinal
    })
}