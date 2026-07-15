import { Request, Response } from "express"
import Job from "../models/job.model"
import AccountCompany from "../models/account-company.model"
import City from "../models/city.model"
export const search = async(req: Request, res: Response) => {
    const dataFinal = []

    const companyList = await AccountCompany.find({})
    const cityList = await City.find({})

    //hashMap
    const companyMap: any = {}
    for(const item of companyList){
        companyMap[item.id] = item
    }

    const cityMap: any = {}
    for(const item of cityList){
        cityMap[item.id] = item
    }

    if(Object.keys(req.query).length > 0) {
        const find:any = {}

        if(req.query.language){
            find.technologies = req.query.language
        }
        const jobs = await Job
            .find(find)
            .sort({
                createdAt: "desc"
            })

        for(const item of jobs){
            const itemFinal = {
                id: item.id,
                companyLogo: "",
                title: item.title,
                companyName: "",
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                position: item.position,
                workingForm: item.workingForm,
                cityName: "",
                technologies: item.technologies
            }
            // const company = await AccountCompany.findOne({
            //     _id: item.companyId
            // })
            // if(company) {
            //     itemFinal.companyLogo = `${company.logo}`
            //     itemFinal.companyName = `${company.companyName}`

            //     const city = await City.findOne({
            //         _id: company.city
            //     })
            //     itemFinal.cityName = `${city?.name}`
            // }
            const company = companyMap[`${item.companyId}`]
            itemFinal.companyLogo = company?.logo || ""
            itemFinal.companyName = company?.companyName || ""
            itemFinal.cityName = cityMap[`${company?.city}`]?.name || ""

            dataFinal.push(itemFinal)
        }
    }
    res.json({
        code: "success",
        message: "Thành công!",
        dataFinal: dataFinal
    })
}