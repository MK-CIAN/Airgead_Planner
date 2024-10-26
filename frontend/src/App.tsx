import './App.css'
import {Routes, Route, useLocation} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Budget from './components/Budget'
import Loans from './components/Loans'
import Pensions from './components/Pensions'
import Investmets from './components/Investments'
import News from './components/News'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password")

  return (
    <>
      {
        noNavbar ?

        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/request/password_reset" element={<PasswordResetRequest/>}/>
          <Route path="/password-reset/:token" element={<PasswordReset/>}/>
        </Routes>

        :

        <Navbar
          content = {
            <Routes>
              <Route element={<ProtectedRoute/>}>
                <Route path="/home" element={<Dashboard/>}/>
                <Route path="/budget" element={<Budget/>}/>
                <Route path="/loans" element={<Loans/>}/>
                <Route path="/pensions" element={<Pensions/>}/>
                <Route path="/investments" element={<Investmets/>}/>
                <Route path="/news" element={<News/>}/>
              </Route>
            </Routes>
          }
        />
      }
    </>
  )
}

export default App
