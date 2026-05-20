import { Search } from 'lucide-react'
import Input from './ui/Input.jsx'
import Select from './ui/Select.jsx'

function SearchAndFilterBar({ search, onSearchChange, filters = [] }) {
  return (
    <div className="mb-5 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm dark:shadow-none md:grid-cols-[1fr_auto]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
        <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search..." className="pl-10" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:flex">
        {filters.map((filter) => (
          <Select key={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} className="min-w-40">
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        ))}
      </div>
    </div>
  )
}

export default SearchAndFilterBar
