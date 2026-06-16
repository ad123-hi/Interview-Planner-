const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


async function extractResumeText(file) {
    if (!file) {
        return ""
    }

    if (file.mimetype === "application/pdf") {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(file.buffer))).getText()
        return resumeContent.text?.trim() || ""
    }

    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        return result.value?.trim() || ""
    }

    const error = new Error("Unsupported resume format. Please upload a PDF or DOCX file.")
    error.status = 400
    throw error
}


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const selfDescription = req.body.selfDescription?.trim() || ""
        const jobDescription = req.body.jobDescription?.trim() || ""

        if (!jobDescription) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        if (!req.file && !selfDescription) {
            return res.status(400).json({
                message: "Please upload a resume or provide a self description."
            })
        }

        const resumeText = await extractResumeText(req.file)

        if (req.file && !resumeText) {
            return res.status(400).json({
                message: "We could not read text from the uploaded file. Please try another PDF or DOCX."
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        const message = error?.message || "Unable to process the uploaded file."

        if (message.includes("API key")) {
            return res.status(502).json({
                message: "Resume uploaded successfully, but AI generation is unavailable because the Gemini API key is invalid or missing."
            })
        }

        if (message.includes("Invalid PDF")) {
            return res.status(400).json({
                message: "The uploaded PDF could not be parsed. Please try another PDF or upload a DOCX file."
            })
        }

        return res.status(error.status || 500).json({
            message
        })
    }

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }
