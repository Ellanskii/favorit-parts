import { useEffect, useRef, useState } from 'react'
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
  const inputRef = useRef(null)

  // Enter ищет по любой длине, автопоиск только от MIN_LENGTH;
  // retry: после ошибки тот же номер можно отправить повторно
  const send = (raw, manual = false) => {
    const number = raw.trim()
    if (number.length < (manual ? 1 : MIN_LENGTH)) return
    if (number === requested && !(manual && brandsStatus === 'failed')) return
    dispatch(fetchBrands(number))
  }

  useEffect(() => {
    send(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const update = (next) => {
    setValue(next)
    const number = next.trim()
    if (number.length < MIN_LENGTH && number !== requested && requested) dispatch(reset())
  }

  const clear = () => {
    update('')
    inputRef.current.focus()
  }

  const onSubmit = (e) => {
    e.preventDefault()
    send(value, true)
  }

  return (
    <form className="position-relative mb-4" onSubmit={onSubmit}>
      <input
        ref={inputRef}
        className="form-control pe-5"
        placeholder="Артикул, например 01089"
        value={value}
        onChange={(e) => update(e.target.value)}
        autoFocus
      />
      {value && (
        <button
          type="button"
          className="btn-close position-absolute top-50 end-0 translate-middle-y me-3"
          aria-label="Очистить"
          onClick={clear}
        />
      )}
    </form>
  )
}
