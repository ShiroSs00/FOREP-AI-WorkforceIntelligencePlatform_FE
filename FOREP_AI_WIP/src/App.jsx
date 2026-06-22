import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TaskPage from './pages/TaskPage.jsx'
import EmployeePage from './pages/EmployeePage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import SprintPage from './pages/SprintPage.jsx'
import EventTimelinePage from './pages/EventTimelinePage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AIInsightsPage from './pages/AIInsightsPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import LeavePage from './pages/LeavePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotificationPage from './pages/NotificationPage.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import OrganizationsPage from './pages/OrganizationsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import IntegrationsPage from './pages/IntegrationsPage.jsx'
import SystemMonitoringPage from './pages/SystemMonitoringPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import RecruitmentPage from './pages/RecruitmentPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProtectedRoute from './components/app/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace state={{ message: 'Tài khoản FOREP được cấp bởi quản trị viên hoặc quản lý. Vui lòng đăng nhập bằng tài khoản đã được cấp.' }} />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TaskPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/teams" element={<TeamPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/sprints" element={<SprintPage />} />
            <Route path="/events" element={<EventTimelinePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/monitoring" element={<SystemMonitoringPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
