import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useCallback, useContext, useEffect, useRef } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context
    const lastFetchedKeyRef = useRef(null)

    const getErrorMessage = (error, fallbackMessage) => {
        return error?.response?.data?.message || fallbackMessage
    }

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return { success: true, data: response.interviewReport }
        } catch (error) {
            const message = getErrorMessage(error, "Unable to generate the interview report.")
            return { success: false, message }
        } finally {
            setLoading(false)
        }
    }

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.log(getErrorMessage(error, "Unable to fetch interview report."))
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReport ])

    const getReports = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            console.log(getErrorMessage(error, "Unable to fetch interview reports."))
            setReports([])
            return []
        } finally {
            setLoading(false)
        }
    }, [ setLoading, setReports ])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(getErrorMessage(error, "Unable to generate resume PDF."))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchKey = interviewId || "__all__"

        if (lastFetchedKeyRef.current === fetchKey) {
            return
        }

        lastFetchedKeyRef.current = fetchKey

        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ getReportById, getReports, interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
