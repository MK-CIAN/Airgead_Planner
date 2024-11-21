import './App.css'
import {Routes, Route, useLocation} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Budget from './components/Budget'
import Loans from './components/LoanCalculator'
import Pensions from './components/Pensions'
import StockSim from './components/StockSim'
import News from './components/News'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'
import Savings from './components/Savings'
import Income from './components/Income'

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
                <Route path="/savings" element={<Savings/>}/>
                <Route path="/loans" element={<Loans/>}/>
                <Route path="/pensions" element={<Pensions/>}/>
                <Route path="/stocksim" element={<StockSim/>}/>
                <Route path="/news" element={<News/>}/>
                <Route path="/income" element={<Income/>}/>
              </Route>
            </Routes>
          }
        />
      }
    </>
  )
}

export default App
