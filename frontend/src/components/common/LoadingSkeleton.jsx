export function LoadingSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="table-container">
      <table className="w-full">
        <tbody className="divide-y divide-outline-variant">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="table-td">
                  <div
                    className="skeleton h-4 rounded"
                    style={{ width: `${50 + ((i + j) * 7) % 40}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kpi-card">
          <div className="skeleton h-3 w-24 rounded mb-3" />
          <div className="skeleton h-8 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
