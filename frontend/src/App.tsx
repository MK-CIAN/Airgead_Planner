import './App.css'
import {Routes, Route, useLocation} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Budget from './components/Budgets/Budget'
import Loans from './components/LoanCalculator'
import Pensions from './components/Pensions'
import StockSim from './components/StockSim'
import News from './components/News'
import Navbar from './components/Navbar'
import Login from './components/Authentication/Login'
import Register from './components/Authentication/Register'
import ProtectedRoute from './components/ProtectedRoutes'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset'
import Savings from './components/Savings/Savings'
import Income from './components/IncomeTaxBreakdown/Income'
import UserInterest from './components/UserInterests'
import CustomBudget from './components/Budgets/CustomBudget'
import CustomBudgetDetails from './components/Budgets/CustomBudgetDetails'
import SavingsGoalDetails from './components/Savings/SavingGoalDetails'
import TestNav from './components/TestNav'

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

        <TestNav
          content = {
            <Routes>
              <Route element={<ProtectedRoute/>}>
                <Route path="/home" element={<Dashboard/>}/>
                <Route path="/budget" element={<Budget/>}/>
                <Route path="/custom-budget" element={<CustomBudget/>}/>
                <Route path="/custom-budget/:id" element={<CustomBudgetDetails />} />
                <Route path="/savings" element={<Savings/>}/>
                <Route path="/savings/:id" element={<SavingsGoalDetails />} />
                <Route path="/loans" element={<Loans/>}/>
                <Route path="/pensions" element={<Pensions/>}/>
                <Route path="/stocksim" element={<StockSim/>}/>
                <Route path="/news" element={<News/>}/>
                <Route path="/income" element={<Income/>}/>
                <Route path="/userinterests" element={<UserInterest/>}/>
              </Route>
            </Routes>
          }
        />
      }
    </>
  )
}

export default App
