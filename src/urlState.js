import { fetchBrands, fetchOffers } from './searchSlice'

// номер и бренд живут в адресе, чтобы ссылкой можно было поделиться
export function restoreFromUrl(store) {
  const params = new URLSearchParams(window.location.search)
  const number = params.get('number')?.trim()
  const brand = params.get('brand')
  if (!number) return

  store.dispatch(fetchBrands(number)).then((action) => {
    if (brand && fetchBrands.fulfilled.match(action)) {
      store.dispatch(fetchOffers({ number, brand }))
    }
  })
}

export function syncUrl(store) {
  store.subscribe(() => {
    const { number, selectedBrand } = store.getState().search
    const params = new URLSearchParams()
    if (number) params.set('number', number)
    if (number && selectedBrand) params.set('brand', selectedBrand)

    const search = params.size ? `?${params}` : ''
    if (search !== window.location.search) {
      window.history.replaceState(null, '', window.location.pathname + search)
    }
  })
}
