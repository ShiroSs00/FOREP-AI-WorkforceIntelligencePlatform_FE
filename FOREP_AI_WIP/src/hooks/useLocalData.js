import { useState } from 'react'
import { getData, setData } from '../utils/storage.js'

export function useLocalData(key, fallback = []) {
  const [items, setItems] = useState(() => getData(key, fallback))

  const updateItems = (nextValue) => {
    const resolved = typeof nextValue === 'function' ? nextValue(getData(key, fallback)) : nextValue
    setData(key, resolved)
    setItems(resolved)
    return resolved
  }

  return [items, updateItems]
}
