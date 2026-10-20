import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { request } from './api'

const initialState = {
  number: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  selectedBrand: null,
  items: [],
  itemsStatus: 'idle',
  itemsError: null,
}

function uniqueBrands(goods) {
  const map = new Map()
  goods.forEach((g) => {
    if (!map.has(g.brand)) map.set(g.brand, { brand: g.brand, name: g.name })
  })
  return [...map.values()]
}

function flatten(goods) {
  const map = new Map()
  goods.forEach((g) => {
    ;[g, ...(g.analogues || [])].forEach((item) => {
      if (map.has(item.goodsID)) return
      const { goodsID, brand, number, name, price, count } = item
      map.set(goodsID, { goodsID, brand, number, name, price, count })
    })
  })
  return [...map.values()]
}

export const fetchBrands = createAsyncThunk('search/fetchBrands', async (number) =>
  uniqueBrands(await request({ number }))
)

export const fetchOffers = createAsyncThunk('search/fetchOffers', async ({ number, brand }) =>
  flatten(await request({ number, brand, analogues: 'on' }))
)

const isStaleOffers = (state, { number, brand }) =>
  number !== state.number || brand !== state.selectedBrand

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => ({
        ...initialState,
        number: action.meta.arg,
        brandsStatus: 'loading',
      }))
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (action.meta.arg !== state.number) return
        state.brandsStatus = 'succeeded'
        state.brands = action.payload
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.arg !== state.number) return
        state.brandsStatus = 'failed'
        state.brandsError = action.error.message
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedBrand = action.meta.arg.brand
        state.itemsStatus = 'loading'
        state.itemsError = null
        state.items = []
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (isStaleOffers(state, action.meta.arg)) return
        state.itemsStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (isStaleOffers(state, action.meta.arg)) return
        state.itemsStatus = 'failed'
        state.itemsError = action.error.message
      })
  },
})

export const { reset } = searchSlice.actions
export default searchSlice.reducer
