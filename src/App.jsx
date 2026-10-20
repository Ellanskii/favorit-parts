import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBrands, fetchOffers } from './searchSlice'
import SearchForm from './components/SearchForm'
import BrandList from './components/BrandList'
import OffersTable from './components/OffersTable'
import Loader from './components/Loader'
import ErrorAlert from './components/ErrorAlert'
import Footer from './components/Footer'

export default function App() {
  const dispatch = useDispatch()
  const s = useSelector((state) => state.search)
  const resultsRef = useRef(null)
  const scrollPending = useRef(false)

  const selectBrand = (brand) => {
    if (brand === s.selectedBrand && s.itemsStatus !== 'failed') return
    scrollPending.current = true
    dispatch(fetchOffers({ number: s.number, brand }))
  }

  // на мобильном длинный список брендов уводит таблицу за экран; крутим, когда данные уже пришли
  useEffect(() => {
    const el = resultsRef.current
    if (!scrollPending.current || !el || s.itemsStatus === 'loading') return
    scrollPending.current = false
    if (el.getBoundingClientRect().top > window.innerHeight * 0.7) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [s.itemsStatus])

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="container py-4 flex-grow-1" style={{ maxWidth: 900 }}>
        <h1 className="h3 mb-4">Поиск запчастей</h1>
        <SearchForm />

        {s.brandsStatus === 'loading' && <Loader />}
        {s.brandsStatus === 'failed' && (
          <ErrorAlert message={s.brandsError} onRetry={() => dispatch(fetchBrands(s.number))} />
        )}
        {s.brandsStatus === 'succeeded' &&
          (s.brands.length ? (
            <>
              <h2 className="h5">Производители</h2>
              <BrandList brands={s.brands} selected={s.selectedBrand} onSelect={selectBrand} />
            </>
          ) : (
            <p className="text-muted">Ничего не найдено</p>
          ))}

        {s.itemsStatus !== 'idle' && (
          <h2 ref={resultsRef} className="h5 mt-4" style={{ scrollMarginTop: 16 }}>
            Предложения и аналоги
          </h2>
        )}
        {s.itemsStatus === 'loading' && <Loader />}
        {s.itemsStatus === 'failed' && (
          <ErrorAlert
            message={s.itemsError}
            onRetry={() => dispatch(fetchOffers({ number: s.number, brand: s.selectedBrand }))}
          />
        )}
        {s.itemsStatus === 'succeeded' &&
          (s.items.length ? (
            <OffersTable items={s.items} brand={s.selectedBrand} />
          ) : (
            <p className="text-muted">Ничего не найдено</p>
          ))}
      </main>
      <Footer />
    </div>
  )
}
