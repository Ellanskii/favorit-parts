const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })

export default function OffersTable({ items, brand }) {
  // сначала запрошенный бренд, потом аналоги по цене; без цены (0) в конец
  const rows = [...items].sort(
    (a, b) =>
      (b.brand === brand) - (a.brand === brand) ||
      (a.price === 0) - (b.price === 0) ||
      a.price - b.price
  )

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Название / Производитель</th>
            <th className="text-end">Цена</th>
            <th className="text-end">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.goodsID} className={item.brand === brand ? 'table-primary' : ''}>
              <td>
                {item.name}
                <div className="text-muted small">
                  {item.brand} · {item.number}
                </div>
              </td>
              <td className="text-end text-nowrap">{item.price ? money.format(item.price) : '—'}</td>
              <td className="text-end">
                {item.count === 0 ? <span className="text-muted">Нет в наличии</span> : `${item.count} шт.`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
