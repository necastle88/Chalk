import { useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div className="app-container">
        <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <h2>Welcome to Chalk</h2>
          <p>Your fitness tracking app</p>
          <button onClick={() => setCount(count + 1)}>
            Count is: {count}
          </button>
        </div>
        </div>
      </div>
  )
}

export default App
