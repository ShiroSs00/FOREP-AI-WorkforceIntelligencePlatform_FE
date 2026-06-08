import { useState } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import Input from '../components/ui/Input.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ThemeToggle from '../components/app/ThemeToggle.jsx'
import { useServiceData } from '../hooks/useServiceData.js'
import { getProfile, updateProfile } from '../services/employeeService.js'
import { getName, valueOf } from '../services/responseNormalizer.js'

const sections = ['Organization profile', 'API configuration', 'GitHub integration settings', 'Google OAuth settings', 'Notification preferences', 'AI model settings', 'Security settings']

function getProfileForm(profile) {
  const [firstName = '', ...restName] = getName(profile).split(' ')
  return {
    firstName: valueOf(profile, ['firstName'], firstName === 'Untitled' ? '' : firstName),
    lastName: valueOf(profile, ['lastName'], restName.join(' ')),
    jobTitle: valueOf(profile, ['jobTitle', 'position', 'role'], ''),
    phoneNumber: valueOf(profile, ['phoneNumber', 'phone'], ''),
    teamId: valueOf(profile, ['teamId'], ''),
    department: valueOf(profile, ['department'], ''),
    avatarInitials: valueOf(profile, ['avatarInitials'], ''),
  }
}

function buildProfilePayload(form) {
  return {
    firstName: form.firstName?.trim() || undefined,
    lastName: form.lastName?.trim() || undefined,
    jobTitle: form.jobTitle?.trim() || undefined,
    phoneNumber: form.phoneNumber?.trim() || undefined,
    teamId: form.teamId?.trim() || undefined,
    department: form.department?.trim() || undefined,
    avatarInitials: form.avatarInitials?.trim() || undefined,
  }
}

function ProfileSettingsForm({ profile, onSaved }) {
  const [form, setForm] = useState(() => getProfileForm(profile))
  const [actionError, setActionError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setActionError('')
    setSavedMessage('')
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setActionError('')
    setSavedMessage('')
    try {
      await updateProfile(buildProfilePayload(form))
      setSavedMessage('Profile updated from backend API.')
      onSaved()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submitProfile} className="mt-5 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Input placeholder="First name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
        <Input placeholder="Last name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
        <Input placeholder="Job title" value={form.jobTitle} onChange={(event) => updateField('jobTitle', event.target.value)} />
        <Input placeholder="Phone number" value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
        <Input placeholder="Team UUID" value={form.teamId} onChange={(event) => updateField('teamId', event.target.value)} />
        <Input placeholder="Department" value={form.department} onChange={(event) => updateField('department', event.target.value)} />
        <Input placeholder="Avatar initials" value={form.avatarInitials} onChange={(event) => updateField('avatarInitials', event.target.value)} />
      </div>
      {savedMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{savedMessage}</p> : null}
      {actionError ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{actionError}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Profile'}</Button>
      </div>
    </form>
  )
}

function ProfileSettingsCard() {
  const { data: profile, loading, error, apiPending, retry } = useServiceData(getProfile, [])

  return (
    <Card className="page-animate opacity-0 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-[var(--text)]">Profile</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Update your personal employee profile from the backend account API.</p>
        </div>
        <Button variant="secondary" onClick={retry}>Refresh</Button>
      </div>

      {loading ? <div className="mt-5"><LoadingState title="Loading profile" description="Reading your profile from the backend." /></div> : null}
      {error ? <div className="mt-5"><ErrorState title="Unable to load profile" description={error.message} status={error.status} details={error.details} onRetry={retry} /></div> : null}
      {apiPending ? <div className="mt-5"><ErrorState description="Profile API is not available yet." onRetry={retry} /></div> : null}

      {!loading && !error && !apiPending ? (
        profile && Object.keys(profile).length ? (
          <ProfileSettingsForm key={`${valueOf(profile, ['employeeId', 'id'], 'profile')}-${valueOf(profile, ['updatedAt'], '')}`} profile={profile} onSaved={retry} />
        ) : (
          <div className="mt-5">
            <EmptyState title="Profile data is not available." description="Please check authentication or retry after the backend returns the employee profile." />
          </div>
        )
      ) : null}
    </Card>
  )
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Product Configuration" description="Configuration placeholders prepared for backend administration features." />
      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileSettingsCard />
        <Card className="page-animate opacity-0 lg:col-span-2">
          <h2 className="font-semibold text-[var(--text)]">Appearance</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Choose how FOREP appears on this device.</p>
          <div className="mt-5">
            <ThemeToggle mode="select" />
          </div>
        </Card>
        {sections.map((section) => <Card key={section} className="page-animate opacity-0"><h2 className="font-semibold text-[var(--text)]">{section}</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">This configuration area will be connected to backend administration APIs later.</p></Card>)}
      </div>
    </>
  )
}

export default SettingsPage
