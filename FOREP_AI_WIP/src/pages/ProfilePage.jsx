import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getProfile, updateProfile } from '../services/employeeService.js'
import { extractBackendMessage, getId, getName, valueOf } from '../services/responseNormalizer.js'

function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', jobTitle: '', phoneNumber: '', department: '', avatarInitials: '' })
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hydrated] = useState(() => ({
    firstName: valueOf(profile, ['firstName'], getName(profile).split(' ')[0] ?? ''),
    lastName: valueOf(profile, ['lastName'], getName(profile).split(' ').slice(1).join(' ')),
    jobTitle: valueOf(profile, ['jobTitle', 'position', 'role'], ''),
    phoneNumber: valueOf(profile, ['phoneNumber', 'phone'], ''),
    department: valueOf(profile, ['department'], ''),
    avatarInitials: valueOf(profile, ['avatarInitials'], ''),
  }))
  const values = Object.values(form).some(Boolean) ? form : hydrated

  const submitProfile = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setActionMessage('')
    try {
      const response = await updateProfile({
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        jobTitle: values.jobTitle || undefined,
        phoneNumber: values.phoneNumber || undefined,
        department: values.department || undefined,
        avatarInitials: values.avatarInitials || undefined,
      })
      setActionMessage(extractBackendMessage(response, 'Profile updated.'))
      onSaved()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="page-animate max-w-2xl opacity-0">
      <form onSubmit={submitProfile} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Tên" value={values.firstName} onChange={(event) => setForm({ ...values, firstName: event.target.value })} />
          <Input placeholder="Họ" value={values.lastName} onChange={(event) => setForm({ ...values, lastName: event.target.value })} />
          <Input placeholder="Chức danh" value={values.jobTitle} onChange={(event) => setForm({ ...values, jobTitle: event.target.value })} />
          <Input placeholder="Số điện thoại" value={values.phoneNumber} onChange={(event) => setForm({ ...values, phoneNumber: event.target.value })} />
          <Input placeholder="Phòng ban" value={values.department} onChange={(event) => setForm({ ...values, department: event.target.value })} />
          <Input placeholder="Ký tự avatar" value={values.avatarInitials} onChange={(event) => setForm({ ...values, avatarInitials: event.target.value })} />
        </div>
        {actionMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</p> : null}
        {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
        <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button></div>
      </form>
    </Card>
  )
}

function ProfilePage() {
  const { data: profile, loading, error, apiPending, retry } = useServiceData(getProfile, [])

  return (
    <>
      <PageHeader title="Hồ sơ" description="Thông tin cá nhân của tài khoản đang đăng nhập." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Không tải được hồ sơ" description={error.message} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="API hồ sơ chưa sẵn sàng." onRetry={retry} /> : null}
      {!loading && !error && !apiPending ? (
        profile && Object.keys(profile).length ? <ProfileForm key={`${getId(profile)}-${valueOf(profile, ['email'], 'profile')}`} profile={profile} onSaved={retry} /> : <EmptyState title="Chưa có dữ liệu hồ sơ." description="Vui lòng kiểm tra đăng nhập hoặc thử lại sau khi backend trả hồ sơ nhân viên." />
      ) : null}
    </>
  )
}

export default ProfilePage
