const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-outline btn-sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {pages}
      </span>
      <button className="btn btn-outline btn-sm" onClick={() => onChange(page + 1)} disabled={page >= pages}>
        Next
      </button>
    </nav>
  );
};

export default Pagination;
