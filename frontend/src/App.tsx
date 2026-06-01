import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { TodoPage } from './modules/todo/TodoPage'
import { ReactionPage } from './modules/reaction/ReactionPage'
import { DreamPage } from './modules/dream/DreamPage'
import DailyStick from './modules/fortune/DailyStick'
import StickDetail from './modules/fortune/StickDetail'
import { DivinationPage } from './modules/divination/DivinationPage'
import { NamePage } from './modules/naming/NamePage'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/reaction" element={<ReactionPage />} />
          <Route path="/dream" element={<DreamPage />} />
          <Route path="/fortune" element={<DailyStick />} />
          <Route path="/fortune/stick/:number" element={<StickDetail />} />
          <Route path="/divination" element={<DivinationPage />} />
          <Route path="/naming" element={<NamePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
