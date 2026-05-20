import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TaskPage from './pages/TaskPage.jsx'
import EmployeePage from './pages/EmployeePage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import EventTimelinePage from './pages/EventTimelinePage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AIInsightsPage from './pages/AIInsightsPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import LeavePage from './pages/LeavePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotificationPage from './pages/NotificationPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/teams" element={<TeamPage />} />
        <Route path="/events" element={<EventTimelinePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
