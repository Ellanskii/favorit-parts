import { afterEach, expect, test, vi } from 'vitest'
import { request } from './api'

const mockFetch = (body, ok = true) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok, status: ok ? 200 : 502, json: () => Promise.resolve(body) }))
  )

afterEach(() => vi.unstubAllGlobals())

test('ошибка из тела ответа превращается в исключение на русском', async () => {
  mockFetch({ error: 'Request quota exceeded!' })
  await expect(request({ number: '123' })).rejects.toThrow('Превышен лимит запросов')
})

test('пустая позиция вместо результата даёт пустой список', async () => {
  mockFetch({ goods: [{ brand: '', name: '', goodsID: '0' }] })
  expect(await request({ number: 'zzz' })).toEqual([])
})

test('сбой сети даёт понятную ошибку', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
  )
  await expect(request({ number: '123' })).rejects.toThrow('Нет связи с сервером')
})
