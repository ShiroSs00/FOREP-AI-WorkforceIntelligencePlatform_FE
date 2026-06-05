import { useCallback, useEffect, useState } from 'react'
import { ApiNotConfiguredError } from '../services/apiClient.js'

export function useServiceData(loader, dependencies = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiPending, setApiPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    let mounted = true
    Promise.resolve()
      .then(() => {
        if (!mounted) return null
        setLoading(true)
        setError(null)
        setApiPending(false)
        return loader()
      })
      .then((result) => {
        if (!mounted) return
        if (result === null) return
        setData(result ?? [])
      })
      .catch((err) => {
        if (!mounted) return
        setData([])
        if (err instanceof ApiNotConfiguredError) setApiPending(true)
        else setError(err)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
    // Service loaders are stable module functions in current pages; callers pass explicit reload keys here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadKey])

  return { data, loading, error, apiPending, setData, retry }
}
