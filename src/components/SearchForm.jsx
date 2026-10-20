import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBrands, reset } from '../searchSlice'
import useDebounce from '../useDebounce'

const MIN_LENGTH = 3
const DELAY = 500

export default function SearchForm() {
  const dispatch = useDispatch()
  const { number: requested, brandsStatus } = useSelector((s) => s.search)
  const [value, setValue] = useState('')
  const debounced = useDebounce(value, DELAY)

  // retry: после ошибки тот же номер можно отправить повторно (Enter)
  const send = (raw, retry = false) => {
    const number = raw.trim()
    if (number.length < MIN_LENGTH) return
    if (number === requested && !(retry && brandsStatus === 'failed')) return
    dispatch(fetchBrands(number))
  }

  useEffect(() => {
    send(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const onChange = (e) => {
    const next = e.target.value
    setValue(next)
    if (next.trim().length < MIN_LENGTH && requested) dispatch(reset())
  }

  const onSubmit = (e) => {
    e.preventDefault()
    send(value, true)
  }

  return (
    <form className="input-group mb-4" onSubmit={onSubmit}>
      <input
        className="form-control"
        placeholder="Артикул, например 01089"
        value={value}
        onChange={onChange}
        autoFocus
      />
      <button className="btn btn-primary">Найти</button>
    </form>
  )
}
