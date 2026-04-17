import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import type { User } from '@/types'
import { authService } from '@/api/auth'

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
    error: string | null
}

type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: { user: User; token: string } }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'LOGOUT' }

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_USER':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
                error: null,
            }
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false }
        case 'LOGOUT':
            return { ...state, user: null, token: null, isLoading: false, error: null }
        default:
            return state
    }
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Check token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            if (token && storedUser) {
                try {
                    const user = JSON.parse(storedUser) as User
                    dispatch({ type: 'SET_USER', payload: { user, token } })
                } catch {
                    dispatch({ type: 'LOGOUT' })
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        dispatch({ type: 'SET_LOADING', payload: true })
        try {
            const data = await authService.login(email, password)

            if (data.user.role !== 'ADMIN_PMI') {
                throw new Error('Akses ditolak. Layar ini khusus Admin UDD PMI Pringsewu.')
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            dispatch({ type: 'SET_USER', payload: { user: data.user, token: data.token } })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Login gagal'
            dispatch({ type: 'SET_ERROR', payload: message })
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'LOGOUT' })
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
