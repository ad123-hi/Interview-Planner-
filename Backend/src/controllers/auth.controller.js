const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const tokenBlacklistModel = require("../models/blacklist.model")

function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production"

    return {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction
    }
}

/**
 * @name registerUserController
 * @description register a new user
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            })
        }

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (existingUser?.email === email) {
            return res.status(400).json({
                message: "Account already exists with this email address"
            })
        }

        if (existingUser?.username === username) {
            return res.status(400).json({
                message: "Username already taken"
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error?.message || "Unable to register user"
        })
    }
}

/**
 * @name loginUserController
 * @description login a user
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, getCookieOptions())

        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error?.message || "Unable to log in user"
        })
    }
}

/**
 * @name logoutUserController
 * @description clear token from user cookie
 * @access public
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", getCookieOptions())

        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: error?.message || "Unable to log out user"
        })
    }
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access private
 */
async function getMeController(req, res) {
    try {
        const currentUser = await userModel.findById(req.user.id)

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: currentUser._id,
                username: currentUser.username,
                email: currentUser.email
            }
        })
    } catch (error) {
        res.status(500).json({
            message: error?.message || "Unable to fetch user details"
        })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
