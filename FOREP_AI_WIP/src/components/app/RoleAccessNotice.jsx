import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import EmptyState from '../EmptyState.jsx'

function RoleAccessNotice() {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-xl">
        <EmptyState title="This view is not available for your account role." description="Return to your dashboard or sign in with an account that has access to this module." />
        <div className="mt-5 flex justify-center">
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  )
}

export default RoleAccessNotice
