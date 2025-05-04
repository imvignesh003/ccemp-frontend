import LoginPage from "@/pages/LoginPage"
import { Route, Routes } from "react-router-dom"

const Navigator = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/login" element={<LoginPage/>} />
        </Routes>
    </>
  )
}

export default Navigator