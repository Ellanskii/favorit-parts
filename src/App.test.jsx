import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { makeStore } from './store'
import App from './App'

const item = (goodsID, brand, name, price, count, extra = {}) => ({ goodsID, brand, name, number: '0189', price, count, ...extra })

const answer = (goods) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ goods }) })

let fetchMock

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  fetchMock = vi.fn((url) => {
    const params = new URL(url, 'http://x').searchParams
    if (params.get('brand')) {
      return answer([
        item('1', 'CAFFARO', 'Ролик', 866, 16, {
          analogues: [item('2', 'ZEN', 'Ролик дешёвый', 300, 0), item('3', 'NGK', 'Ролик дорогой', 1500, 5)],
        }),
      ])
    }
    return answer([item('1', 'CAFFARO', 'Ролик', 866, 16), item('9', 'ZEN', 'Свеча', 100, 1)])
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const setup = () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(
    <Provider store={makeStore()}>
      <App />
    </Provider>
  )
  return user
}

test('два этапа: бренды, затем таблица с запрошенным брендом сверху', async () => {
  const user = setup()

  await user.type(screen.getByRole('textbox'), '0189')
  await act(() => vi.advanceTimersByTimeAsync(500))

  await user.click(await screen.findByRole('button', { name: /CAFFARO/ }))

  const rows = (await screen.findAllByRole('row')).slice(1)
  expect(rows).toHaveLength(3)
  expect(within(rows[0]).getByText('Ролик')).toBeInTheDocument()
  expect(within(rows[1]).getByText('Ролик дешёвый')).toBeInTheDocument()
  expect(within(rows[1]).getByText('Нет в наличии')).toBeInTheDocument()
  expect(within(rows[2]).getByText('Ролик дорогой')).toBeInTheDocument()
})

test('Enter и сработавший debounce дают один запрос', async () => {
  const user = setup()

  await user.type(screen.getByRole('textbox'), '0189{Enter}')
  await act(() => vi.advanceTimersByTimeAsync(1000))

  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('если стереть номер короче минимума, результаты пропадают', async () => {
  const user = setup()
  const input = screen.getByRole('textbox')

  await user.type(input, '0189{Enter}')
  await screen.findByRole('button', { name: /CAFFARO/ })

  await user.clear(input)
  expect(screen.queryByRole('button', { name: /CAFFARO/ })).not.toBeInTheDocument()
})

test('Enter ищет и по короткому номеру, автопоиск — нет', async () => {
  const user = setup()
  const input = screen.getByRole('textbox')

  await user.type(input, '01')
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(fetchMock).not.toHaveBeenCalled()

  await user.type(input, '{Enter}')
  await screen.findByRole('button', { name: /CAFFARO/ })
  await user.type(input, ' ')
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: /CAFFARO/ })).toBeInTheDocument()
})

test('крестик очищает поле и результаты, пока поле пустое его нет', async () => {
  const user = setup()
  const input = screen.getByRole('textbox')
  expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()

  await user.type(input, '0189{Enter}')
  await screen.findByRole('button', { name: /CAFFARO/ })

  await user.click(screen.getByRole('button', { name: 'Очистить' }))
  expect(input).toHaveValue('')
  expect(screen.queryByRole('button', { name: /CAFFARO/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
})
