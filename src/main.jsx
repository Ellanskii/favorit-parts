import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'
import { store } from './store'
import { restoreFromUrl, syncUrl } from './urlState'
import App from './App'

restoreFromUrl(store)
syncUrl(store)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
