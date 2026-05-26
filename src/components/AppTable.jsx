export default function AppTable({ columns, data, emptyText = 'No records found', className = '' }) {
  return (
    <div className={`app-table-wrapper ${className}`.trim()}>
      <table className="app-table">
        <thead>
          <tr>{columns.map((col) => <th key={col.key || col.label}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="app-table-empty">{emptyText}</td></tr>
          ) : data.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (<td key={col.key || col.label}>{col.render ? col.render(row) : row[col.key]}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
