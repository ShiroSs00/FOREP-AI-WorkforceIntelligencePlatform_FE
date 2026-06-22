import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import EmptyState from '../EmptyState.jsx'

function RoleAccessNotice() {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-xl">
        <EmptyState title="Tài khoản của bạn không có quyền mở màn này." description="Vui lòng quay lại tổng quan hoặc đăng nhập bằng tài khoản có quyền phù hợp." />
        <div className="mt-5 flex justify-center">
          <Button onClick={() => navigate('/dashboard')}>Về tổng quan</Button>
        </div>
      </div>
    </div>
  )
}

export default RoleAccessNotice
