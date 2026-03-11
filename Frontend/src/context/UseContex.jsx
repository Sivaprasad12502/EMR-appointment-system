import { useState } from "react";
import { createContext } from "react";
import { useNavigate} from "react-router-dom";

export const Context=createContext()
export const ContextProvider=({children})=>{
    const navigate=useNavigate()
    const [user,setUser]=useState(JSON.parse(localStorage.getItem('user'))||null)
    const [token,setToken]=useState(localStorage.getItem('token')||null)

    const storeData=({user,token,refresh})=>{
        localStorage.setItem('user',JSON.stringify(user))
        localStorage.setItem('token',token)
        localStorage.setItem('refreshToken',refresh)
        setUser(user)
        setToken(token)
    }
    const logout=()=>{
        localStorage.clear()
        setUser(null)
        setToken(null)
        navigate("/login")
    }
    return (
        <Context.Provider value={{ user,token, storeData, logout }}>
            {children}
        </Context.Provider>
    )
}