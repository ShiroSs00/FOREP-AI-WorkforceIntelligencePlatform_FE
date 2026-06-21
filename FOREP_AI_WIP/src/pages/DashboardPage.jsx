import { useRole } from '../context/role.js'
import AdminDashboard from './dashboards/AdminDashboard.jsx'
import DirectorDashboard from './dashboards/DirectorDashboard.jsx'
import ManagerDashboard from './dashboards/ManagerDashboard.jsx'
import EmployeeDashboard from './dashboards/EmployeeDashboard.jsx'

const dashboards = {
  admin: AdminDashboard,
  director: DirectorDashboard,
  manager: ManagerDashboard,
  employee: EmployeeDashboard,
}

function DashboardPage() {
  const { selectedRole } = useRole()
  const Dashboard = dashboards[selectedRole] ?? ManagerDashboard
  return <Dashboard />
}

export default DashboardPage
