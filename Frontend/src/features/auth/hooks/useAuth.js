import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context
    const hasInitialized = useRef(false)


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return { success: true, user: data.user }
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || "Unable to log in right now."
            }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return { success: true, user: data.user }
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || "Unable to create your account right now."
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return { success: true }
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || "Unable to log out right now."
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (hasInitialized.current) {
            return
        }

        hasInitialized.current = true

        const publicRoutes = ["/login", "/register"]

        if (publicRoutes.includes(window.location.pathname)) {
            setLoading(false)
            return
        }

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data?.user || null)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [ setLoading, setUser ])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
