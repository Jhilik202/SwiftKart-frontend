// A friendly empty or "not allowed" screen with an icon. Buttons go inside as children.
const EmptyState = ({ icon: Icon, title, text, children }) => (
  <div className="empty-state">
    {Icon && (
      <span className="empty-icon" aria-hidden="true">
        <Icon size={28} />
      </span>
    )}
    <h2>{title}</h2>
    {text && <p>{text}</p>}
    {children}
  </div>
);

export default EmptyState;
