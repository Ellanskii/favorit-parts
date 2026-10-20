export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
      <span>{message}</span>
      <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
        Повторить
      </button>
    </div>
  )
}
