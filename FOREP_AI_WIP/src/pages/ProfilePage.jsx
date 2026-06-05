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
import { getId, getName, valueOf } from '../services/responseNormalizer.js'

function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', jobTitle: '', phoneNumber: '', teamId: '', department: '', avatarInitials: '' })
  const [actionError, setActionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hydrated] = useState(() => ({
    firstName: valueOf(profile, ['firstName'], getName(profile).split(' ')[0] ?? ''),
    lastName: valueOf(profile, ['lastName'], getName(profile).split(' ').slice(1).join(' ')),
    jobTitle: valueOf(profile, ['jobTitle', 'position', 'role'], ''),
    phoneNumber: valueOf(profile, ['phoneNumber', 'phone'], ''),
    teamId: valueOf(profile, ['teamId'], ''),
    department: valueOf(profile, ['department'], ''),
    avatarInitials: valueOf(profile, ['avatarInitials'], ''),
  }))
  const values = Object.values(form).some(Boolean) ? form : hydrated

  const submitProfile = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    try {
      await updateProfile({
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        jobTitle: values.jobTitle || undefined,
        phoneNumber: values.phoneNumber || undefined,
        teamId: values.teamId || undefined,
        department: values.department || undefined,
        avatarInitials: values.avatarInitials || undefined,
      })
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
          <Input placeholder="First name" value={values.firstName} onChange={(event) => setForm({ ...values, firstName: event.target.value })} />
          <Input placeholder="Last name" value={values.lastName} onChange={(event) => setForm({ ...values, lastName: event.target.value })} />
          <Input placeholder="Job title" value={values.jobTitle} onChange={(event) => setForm({ ...values, jobTitle: event.target.value })} />
          <Input placeholder="Phone number" value={values.phoneNumber} onChange={(event) => setForm({ ...values, phoneNumber: event.target.value })} />
          <Input placeholder="Team UUID" value={values.teamId} onChange={(event) => setForm({ ...values, teamId: event.target.value })} />
          <Input placeholder="Department" value={values.department} onChange={(event) => setForm({ ...values, department: event.target.value })} />
          <Input placeholder="Avatar initials" value={values.avatarInitials} onChange={(event) => setForm({ ...values, avatarInitials: event.target.value })} />
        </div>
        {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
        <div className="flex justify-end"><Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Profile'}</Button></div>
      </form>
    </Card>
  )
}

function ProfilePage() {
  const { data: profile, loading, error, apiPending, retry } = useServiceData(getProfile, [])

  return (
    <>
      <PageHeader title="Profile" description="Personal employee profile for the signed-in account." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState title="Unable to load profile" description={error.message} status={error.status} details={error.details} onRetry={retry} /> : null}
      {apiPending ? <ErrorState description="Profile data is not available yet." onRetry={retry} /> : null}
      {!loading && !error && !apiPending ? (
        profile && Object.keys(profile).length ? <ProfileForm key={`${getId(profile)}-${valueOf(profile, ['email'], 'profile')}`} profile={profile} onSaved={retry} /> : <EmptyState title="Profile data is not available." description="Please check authentication or retry after the backend returns the employee profile." />
      ) : null}
    </>
  )
}

export default ProfilePage
