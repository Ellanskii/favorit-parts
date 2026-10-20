export default function BrandList({ brands, selected, onSelect }) {
  return (
    <div className="list-group">
      {brands.map(({ brand, name }) => (
        <button
          key={brand}
          type="button"
          className={`list-group-item list-group-item-action ${brand === selected ? 'active' : ''}`}
          onClick={() => onSelect(brand)}
        >
          <strong>{brand}</strong>
          <span className="ms-2 opacity-75">{name}</span>
        </button>
      ))}
    </div>
  )
}
