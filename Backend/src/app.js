const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const multer = require("multer")

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error("CORS origin is not allowed"))
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "API is healthy"
    })
})

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "File is too large. Please upload a file smaller than 5MB."
        })
    }

    if (err) {
        return res.status(err.status || 400).json({
            message: err.message || "Something went wrong."
        })
    }

    next()
})


module.exports = app
