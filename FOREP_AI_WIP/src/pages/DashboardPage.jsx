import { useRole } from '../context/role.js'
import AdminDashboard from './dashboards/AdminDashboard.jsx'
import ManagerDashboard from './dashboards/ManagerDashboard.jsx'
import HRDashboard from './dashboards/HRDashboard.jsx'
import EmployeeDashboard from './dashboards/EmployeeDashboard.jsx'

const dashboards = {
  admin: AdminDashboard,
  manager: ManagerDashboard,
  hr: HRDashboard,
  employee: EmployeeDashboard,
}

function DashboardPage() {
  const { selectedRole } = useRole()
  const Dashboard = dashboards[selectedRole] ?? ManagerDashboard
  return <Dashboard />
}

export default DashboardPage
