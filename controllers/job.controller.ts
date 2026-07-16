import { Request, Response } from "express"
import Job from "../models/job.model"
import { title } from "node:process"
import AccountCompany from "../models/account-company.model"
export const detail = async(req: Request, res: Response) => {
    try {
        const id = req.params.id

        const record = await Job.findOne({
            _id: id
        })
        if(!record){
            res.json({
                code: "error",
                message: "Thất bại!"
            })
            return
        }

        const jobDetail = {
            id: record.id,
            title: record.title,
            companyName: "",
            salaryMin: record.salaryMin,
            salaryMax: record.salaryMax,
            position: record.position,
            workingForm: record.workingForm,
            images: record.images,
            address: "",
            technologies: record.technologies,
            description: record.description,
            companyLogo: "",
            companyModel: "",
            companyEmployees: "",
            companyWorkingTime: "",
            companyWorkOvertime: "",
            companyId: record.companyId
        }
        const infoCompany = await AccountCompany.findOne({
            _id: record.companyId
        })

        if(infoCompany){
            jobDetail.companyName = `${infoCompany.companyName}`,
            jobDetail.address = `${infoCompany.address}`,
            jobDetail.companyLogo = `${infoCompany.logo}`,
            jobDetail.companyModel = `${infoCompany.companyModel}`,
            jobDetail.companyEmployees = `${infoCompany.companyEmployees}`,
            jobDetail.companyWorkingTime = `${infoCompany.workingTime}`,
            jobDetail.companyWorkOvertime = `${infoCompany.workOvertime}`
        }
        res.json({
            code: "success",
            message: "Thành công!",
            jobDetail: jobDetail
        })
    } catch (error) {
        console.log(error)
        res.json({
            code: 'error',
            message: "Thất bại!"
        })
    }
}