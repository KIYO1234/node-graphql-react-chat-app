import React, { createContext, useReducer, useContext } from 'react';
import jwtDecode from 'jwt-decode';

const AuthStateContext = createContext()
const AuthDispatchContext = createContext()

let user = null
console.log('user first : ', user)

const token = localStorage.getItem('token')
if (token) {
    const decodedToken = jwtDecode(token)
    const expiresAt = new Date(decodedToken.exp * 1000)
    console.log('decodedToken: ', decodedToken)
    console.log('expiresAt: ', expiresAt)

    if (new Date() > expiresAt) {
        localStorage.removeItem('token')
        console.log('token has been removed because it expired')
    } else {
        user = decodedToken
        console.log('user: ', user)
    }
    
} else {
    console.log('no token found')   
}

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            localStorage.setItem('token', action.payload.token)
            return {
                ...state,
                user: action.payload
            }
        case 'LOGOUT':
            localStorage.removeItem('token')
            return {
                ...state,
                user: null
            }
        default:
            throw new Error(`Unknown action type: ${action.type}`)
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user })
    return (
        <AuthDispatchContext.Provider value={dispatch}>
            <AuthStateContext.Provider value={state}>
                {children}
            </AuthStateContext.Provider>
        </AuthDispatchContext.Provider>
    )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)
