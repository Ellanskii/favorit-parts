import { afterEach, expect, test, vi } from 'vitest'
import { makeStore } from './store'
import { fetchBrands, fetchOffers } from './searchSlice'

const item = (goodsID, brand, extra = {}) => ({ goodsID, brand, name: 'n' + goodsID, number: '1', price: 10, count: 1, ...extra })

const respond = (goods) => ({ ok: true, status: 200, json: () => Promise.resolve({ goods }) })

afterEach(() => vi.unstubAllGlobals())

test('бренды уникальны, name берётся у первой позиции', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(respond([item('1', 'A', { name: 'first' }), item('2', 'A'), item('3', 'B')]))))
  const store = makeStore()
  await store.dispatch(fetchBrands('123'))
  expect(store.getState().search.brands).toEqual([
    { brand: 'A', name: 'first' },
    { brand: 'B', name: 'n3' },
  ])
})

test('аналоги разворачиваются, дубли по goodsID убираются', async () => {
  const main = { ...item('1', 'A'), analogues: [item('2', 'B'), item('1', 'A')] }
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(respond([main, item('2', 'B')]))))
  const store = makeStore()
  await store.dispatch(fetchBrands('123'))
  await store.dispatch(fetchOffers({ number: '123', brand: 'A' }))
  expect(store.getState().search.items.map((i) => i.goodsID)).toEqual(['1', '2'])
})

test('ответ на устаревший запрос игнорируется', async () => {
  const resolvers = {}
  vi.stubGlobal(
    'fetch',
    vi.fn((url) => new Promise((resolve) => (resolvers[new URL(url, 'http://x').searchParams.get('number')] = resolve)))
  )
  const store = makeStore()
  const first = store.dispatch(fetchBrands('111'))
  const second = store.dispatch(fetchBrands('222'))

  resolvers['222'](respond([item('2', 'NEW')]))
  await second
  resolvers['111'](respond([item('1', 'OLD')]))
  await first

  expect(store.getState().search.brands).toEqual([{ brand: 'NEW', name: 'n2' }])
})
