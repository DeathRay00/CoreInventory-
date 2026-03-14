import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function DataTable({
  columns,
  data,
  loading,
  onSearch,
  searchPlaceholder = 'Search…',
  filters,
  actions,
  page,
  onPageChange,
  pageSize = 20,
  total,
}) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {(onSearch || filters || actions) && (
        <div className="filter-bar" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          {onSearch && (
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                className="form-control"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}
          {filters}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>{actions}</div>
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <h3>No records found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id || i}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {onPageChange && (
        <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <span className="text-muted" style={{ fontSize: 12 }}>
            Showing {data.length} {total != null ? `of ${total}` : ''}
          </span>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" disabled={data.length < pageSize} onClick={() => onPageChange(page + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
