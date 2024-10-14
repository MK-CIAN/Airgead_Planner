import './App.css'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Budget from './components/Budget'
import Loans from './components/Loans'
import Pensions from './components/Pensions'
import Investmets from './components/Investments'
import News from './components/News'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <Navbar
        content = {
          <Routes>
            <Route path="" element={<Dashboard/>}/>
            <Route path="/budget" element={<Budget/>}/>
            <Route path="/loans" element={<Loans/>}/>
            <Route path="/pensions" element={<Pensions/>}/>
            <Route path="/investments" element={<Investmets/>}/>
            <Route path="/news" element={<News/>}/>
          </Routes>
        }
      />
    </>
  )
}

export default App
