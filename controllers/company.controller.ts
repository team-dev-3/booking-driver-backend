import { Request, Response } from "express"
import AccountCompany from "../models/account-company.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AccountRequest } from "../interface/request.interface"
import { parse } from "node:path"
import Job from "../models/job.model"
import City from "../models/city.model"
import { title } from "node:process"
import CV from "../models/cv.model"
import { any } from "joi"

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
            req.body.images.push(item.path)
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
    const find = {
        companyId: req.account.id
    }

    //Phân trang
    const limitItem = 3
    let page = 1
    if(req.query.page){
        const currentPage = parseInt(`${req.query.page}`)
        if(currentPage > 0){
            page = currentPage
        }
    }

    const totalItem = await Job.countDocuments(find)
    const totalPage = Math.ceil(totalItem/limitItem)
    const skip = (page-1)*limitItem

    //Hết phân trang    

    const listJob = await Job
        .find(find)
        .sort({
            createdAt: "desc"
        })
        .limit(limitItem)
        .skip(skip)

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
        jobs: dataFinal,
        totalPage: totalPage
    })
}

export const editJob = async(req: AccountRequest, res: Response) => {
    try {
        const id = req.params.id
        const jobDetail = await Job.findOne({
            _id: id,
            companyId: req.account.id
        })
        if(!jobDetail){
            res.json({
                code: "error",
                message: "Id không hợp lệ!"
            })
            return
        }
        res.json({
            code: "success",
            message: "Thành công!",
            jobDetail: jobDetail
        })

    } catch (error) {
        console.log(error)
        res.json({
            code: "error",
            message: "Id không hợp lệ!"
        })
    }
}

export const editJobPatch = async(req: AccountRequest, res: Response) => {
    try {
        const id = req.params.id 
        req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0
        req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0
        req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : []
        req.body.images = []

        if(req.files){
            for(const item of req.files as any[]){
                req.body.images.push(item.path)
            }
        }

        await Job.updateOne({
            _id: id,
            companyId: req.account.id
        }, req.body)
        res.json({
            code: "success",
            message: "Cập nhật công việc thành công!"
        })
    } catch (error) {
        console.log(error)
        res.json({
            code: 'error',
            message: 'Id không hợp lệ!'
        })
    }
}

export const deleteJobDel = async(req: AccountRequest, res: Response) => {
    try {
        const id = req.params.id
        await Job.deleteOne({
            _id: id,
            companyId: req.account.id
        })
        res.json({
            code: "success",
            message: "Xóa công việc thành công!"
        })
    } catch (error) {
        console.log(error)
        res.json({
            code: "error",
            message: "Id không hợp lệ!"
        })
    }
}

export const list = async(req: AccountRequest, res: Response) => {
    //Phân trang
    let limitItems = 12
    if(req.query.limitItems){
        limitItems = parseInt(`${req.query.limitItems}`)
    }
    let page = 1
    if(req.query.page){
        const currentPage = parseInt(`${req.query.page}`)
        page = currentPage
    }
    const totalCompany = await AccountCompany.countDocuments({})
    const totalPage = Math.ceil(totalCompany/limitItems)
    const skip = (page - 1)*limitItems

    const companyList = await AccountCompany
        .find({})
        .limit(limitItems)
        .sort({
            createdAt: "desc"
        })
        .skip(skip)

    const companyListFinal = []

    for (const item of companyList){
        const dataItemFinal = {
            id: item.id,
            logo: item.logo,
            companyName: item.companyName,
            cityName: "",
            totalJob: 0
        }

        const city = await City.findOne({
            _id: item.city
        })
        dataItemFinal.cityName = `${city?.name}`

        const totalJob = await Job.countDocuments({
            companyId: item.id
        })
        dataItemFinal.totalJob = totalJob

        companyListFinal.push(dataItemFinal)
    }
    res.json({
        code: 'success',
        message: "Thành công!",
        companyList: companyListFinal,
        totalPage: totalPage
    })
}

export const detail = async(req: Request, res: Response) => {
    try {
        const id = req.params.id
        const record = await AccountCompany.findOne({
            _id: id
        })
        if(!record){
            res.json({
                code: "error",
                message: "Thất bại!"
            })
            return
        }
        const dataCompany = {
            id: record.id,
            logo: record.logo,
            title: record.companyName,
            address: record.address,
            companyModel: record.companyModel,
            companyEmployees: record.companyEmployees,
            workingTime: record.workingTime,
            workOvertime: record.workOvertime,
            description: record.description
        }
        const city = await City.findOne({
            _id: record.city
        })
        const jobList = await Job.find({
            companyId: record.id
        })
        const dataJobList = []
        for(const item of jobList){
            const dataJob = {
            id: item.id,
            title: item.title,
            companyLogo: record.logo,
            companyName: record.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            position: item.position,
            workingForm: item.workingForm,
            cityName: "",
            technologies: item.technologies,

            }
            
            dataJob.cityName = `${city?.name}`
            dataJobList.push(dataJob)
        }

        res.json({
            code: "success",
            dataCompany: dataCompany,
            dataJobList: dataJobList
        })
    } catch (error) {
        console.log(error)
        res.json({
            code: "error",
            message: "Thất bại!"
        })
    }
}

export const cvList = async(req: AccountRequest, res: Response) => {
    const companyId = req.account.id

    const listJob = await Job.find({
        companyId: companyId
    })
    const listJobId = listJob.map(item => item.id)
    const cvList = await CV.find({
        jobId: {$in: listJobId}
    })
    .sort({
        createdAt: "desc"
    })

    const dataFinal = []
    //hashmap
    const jobHashmap: any = {}
    for(const item of listJob){
        jobHashmap[item.id] = item
    }

    for(const item of cvList){
        const cvData = {
            id: item.id,
            jobTitle: "",
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
            salaryMin: "",
            salaryMax: "",
            position: "",
            workingForm: "",
            viewed: item.viewed,
            status: item.status
        }
        const job = jobHashmap[`${item.jobId}`]
        cvData.jobTitle = job.title
        cvData.salaryMin = job.salaryMin
        cvData.salaryMax = job.salaryMax
        cvData.position = job.position
        cvData.workingForm = job.workingForm
        dataFinal.push(cvData)
    }

    res.json({
        code: "success",
        message: "Thành công!",
        dataFinal: dataFinal
    })

}

export const detailCV = async(req: AccountRequest, res: Response) => {
    try {
        const companyId = req.account.id
        const cvId = req.params.id

        const cvDetail = await CV.findOne({
            _id: cvId
        })
        if(!cvDetail){
            res.json({
                code: "error",
                message: "Thất bại!"
            })
            return
        }
        const dataCV = {
            id: cvDetail.id,
            fullName: cvDetail.fullName,
            email: cvDetail.email,
            phone: cvDetail.phone,
            fileCV: cvDetail.fileCV
        }

        const jobDetail = await Job.findOne({
            _id: cvDetail.jobId,
            companyId: companyId,
        })
        if(!jobDetail){
            res.json({
                code: "error",
                message: "Thất bại!"
            })
            return
        }
        const dataJob = {
            id: jobDetail.id,
            title: jobDetail.title,
            salaryMin: jobDetail.salaryMin,
            salaryMax: jobDetail.salaryMax,
            position: jobDetail.position,
            workingForm: jobDetail.workingForm,
            technologies: jobDetail.technologies
        }

        await CV.updateOne({
            _id: cvDetail.id
        }, {
            viewed: true
        })

        res.json({
            code: "success",
            message: "Thành công!",
            dataCV: dataCV,
            dataJob: dataJob
        })
    } catch (error) {
        console.log(error),
        res.json({
            code: "error",
            message: "Thất bại!"
        })
    }
}