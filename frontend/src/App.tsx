import './App.css'
import {Routes, Route, useLocation} from 'react-router-dom'
import Dashboard from './components/Home/Dashboard'
import Budget from './components/Budgets/Budget'
import Loans from './components/Loans/LoanCalculator'
import Pensions from './components/Pensions/Pensions'
import StockSim from './components/StockSimulator/StockSim'
import News from './components/FinancialNews/News'
import AuthPage from './components/Authentication/Auth'
import ProtectedRoute from './components/Services/ProtectedRoutes'
import PasswordResetRequest from './components/Authentication/PasswordResetRequest'
import PasswordReset from './components/Authentication/PasswordReset'
import Savings from './components/Savings/Savings'
import Income from './components/IncomeTaxBreakdown/Income'
import UserInterest from './components/UserServices/UserInterests'
import CustomBudget from './components/Budgets/BudgetLanding'
import CustomBudgetDetails from './components/Budgets/CustomBudgetDetails'
import SavingsGoalDetails from './components/Savings/SavingGoalDetails'
import Navigation from './components/Services/Navigation'
import { Toaster } from './components/ui/toaster';
import FinancialSuggestions from './components/FinancialInsights/FinancialInsights'
import LoanDetails from './components/Loans/LoanDetails'
import StockSimLanding from './components/StockSimulator/StockSimLanding'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/" || location.pathname === "/register" || location.pathname.includes("password");

  return (
    <>
      {/* Add Toaster here */}
      <Toaster />
      {noNavbar ? (
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/request/password_reset" element={<PasswordResetRequest />} />
          <Route path="/password-reset/:token" element={<PasswordReset />} />
        </Routes>
      ) : (
        <Navigation
          content={
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Dashboard />} />
                <Route path="/budget/monthly-budget" element={<Budget />} />
                <Route path="/budget" element={<CustomBudget />} />
                <Route path="/budget/custom-budget/:id" element={<CustomBudgetDetails />} />
                <Route path="/savings" element={<Savings />} />
                <Route path="/savings/:id" element={<SavingsGoalDetails />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/loans/loan-details/:id" element={<LoanDetails />} />
                <Route path="/pensions" element={<Pensions />} />
                <Route path="/stocksimlanding" element={<StockSimLanding/>} />
                <Route path="/stocksim" element={<StockSim />} />
                <Route path="/news" element={<News />} />
                <Route path="/income" element={<Income />} />
                <Route path="/userinterests" element={<UserInterest />} />
                <Route path="/financial-suggestions" element={<FinancialSuggestions />} />
              </Route>
            </Routes>
          }
        />
      )}
    </>
  );
}

export default App
