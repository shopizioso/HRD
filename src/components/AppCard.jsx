export default function AppCard({ children, title, className = '', footer, ...props }) {
  return (
    <section className={`app-card ${className}`.trim()} {...props}>
      {title && <div className="app-card-header"><h3>{title}</h3></div>}
      <div className="app-card-body">{children}</div>
      {footer && <div className="app-card-footer">{footer}</div>}
    </section>
  );
}
