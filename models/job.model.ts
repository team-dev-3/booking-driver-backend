import mongoose from "mongoose";
import { title } from "node:process";

const schema = new mongoose.Schema({
    companyId: String,
    title: String,
    salaryMin: Number,
    salaryMax: Number,
    position: String,
    workingForm: String,
    technologies: Array,
    description: String,
    images: Array
}, {
    timestamps: true
})

const Job = mongoose.model("Job", schema, "jobs")
export default Job