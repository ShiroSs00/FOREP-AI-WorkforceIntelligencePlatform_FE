import PageHeader from '../components/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import ThemeToggle from '../components/app/ThemeToggle.jsx'

const sections = ['Organization profile', 'API configuration', 'GitHub integration settings', 'Google OAuth settings', 'Notification preferences', 'AI model settings', 'Security settings']

function SettingsPage() {
  return (
    <>
      <PageHeader title="Product Configuration" description="Configuration placeholders prepared for backend administration features." />
      <div className="grid gap-5 lg:grid-cols-2">
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
