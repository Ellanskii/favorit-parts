import { configureStore } from '@reduxjs/toolkit'
import search from './searchSlice'

export const makeStore = () => configureStore({ reducer: { search } })

export const store = makeStore()
