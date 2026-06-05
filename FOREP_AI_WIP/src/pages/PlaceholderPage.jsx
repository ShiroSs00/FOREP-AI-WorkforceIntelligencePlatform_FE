import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'

function PlaceholderPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState title={`${title} is not available yet.`} description="This module will show records after the backend and role permissions support it." />
      <div className="mt-5">
        <Button variant="secondary" disabled>Backend action is not connected yet.</Button>
      </div>
    </>
  )
}

export default PlaceholderPage
