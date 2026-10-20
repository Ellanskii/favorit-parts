import { Fragment, useState } from 'react'

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })
const day = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Europe/Moscow' })

const formatPrice = (price) => (price ? money.format(price) : '—')

function nearestDate(warehouses) {
  const dates = warehouses
    .filter((w) => w.stock > 0)
    .map((w) => w.shipmentDate)
    .sort()
  return dates.length ? day.format(new Date(dates[0])) : null
}

export default function OffersTable({ items, brand }) {
  const [open, setOpen] = useState(null)
  const [inStock, setInStock] = useState(false)

  // сначала запрошенный бренд, потом аналоги по цене; без цены (0) в конец
  const rows = items
    .filter((i) => !inStock || i.count > 0)
    .sort(
      (a, b) =>
        (b.brand === brand) - (a.brand === brand) || (a.price === 0) - (b.price === 0) || a.price - b.price
    )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="in-stock"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="in-stock">
            Только в наличии
          </label>
        </div>
        <span className="text-muted small">
          {rows.length} из {items.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted">Нет позиций в наличии</p>
      ) : (
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
              {rows.map((item) => {
                const date = nearestDate(item.warehouses)
                const expandable = item.warehouses.length > 0
                const isOpen = open === item.goodsID
                const toggle = () => setOpen(isOpen ? null : item.goodsID)

                return (
                  <Fragment key={item.goodsID}>
                    <tr
                      className={item.brand === brand ? 'table-primary' : ''}
                      style={expandable ? { cursor: 'pointer' } : undefined}
                      onClick={expandable ? toggle : undefined}
                      onKeyDown={
                        expandable
                          ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle())
                          : undefined
                      }
                      tabIndex={expandable ? 0 : undefined}
                      aria-expanded={expandable ? isOpen : undefined}
                    >
                      <td>
                        {item.name}
                        <div className="text-muted small">
                          {item.brand} · {item.number}
                          {expandable && ` · складов: ${item.warehouses.length} ${isOpen ? '▴' : '▾'}`}
                        </div>
                      </td>
                      <td className="text-end text-nowrap">{formatPrice(item.price)}</td>
                      <td className="text-end">
                        {item.count === 0 ? (
                          <span className="text-muted">Нет в наличии</span>
                        ) : (
                          `${item.count} шт.`
                        )}
                        {date && <div className="text-muted small text-nowrap">с {date}</div>}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={3} className="bg-body-tertiary p-0">
                          <table className="table table-sm mb-0 small bg-transparent">
                            <thead>
                              <tr>
                                <th className="ps-3">Склад</th>
                                <th className="text-end">Цена</th>
                                <th className="text-end">Остаток</th>
                                <th className="text-end pe-3">Отгрузка</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...item.warehouses]
                                .sort((a, b) => a.shipmentDate.localeCompare(b.shipmentDate))
                                .map((w) => (
                                  <tr key={w.id}>
                                    <td className="ps-3">{w.code}</td>
                                    <td className="text-end text-nowrap">{formatPrice(w.price)}</td>
                                    <td className="text-end">{w.stock} шт.</td>
                                    <td className="text-end text-nowrap pe-3">
                                      {day.format(new Date(w.shipmentDate))}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
