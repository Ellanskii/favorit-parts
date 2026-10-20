const ERRORS = {
  'Empty key!': 'Не указан ключ API',
  'Invalid key client!': 'Неверный ключ API',
  'Invalid access key': 'Неверный ключ API',
  'Empty number goods!': 'Не указан артикул',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже',
}

// ключ API подставляет прокси (vite в dev, nginx в проде), в браузер он не попадает
export async function request(params) {
  const query = new URLSearchParams(params)

  let res
  try {
    res = await fetch(`/api/?${query}`)
  } catch {
    throw new Error('Нет связи с сервером')
  }
  if (!res.ok) throw new Error(`Сервер ответил с ошибкой ${res.status}`)

  const data = await res.json()
  if (data.error) throw new Error(ERRORS[data.error] || data.error)

  // если ничего не найдено, API отдаёт одну пустую позицию вместо пустого списка
  return data.goods.filter((g) => g.brand)
}
