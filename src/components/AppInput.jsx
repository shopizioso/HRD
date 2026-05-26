export default function AppInput({ label, type = 'text', value, onChange, placeholder, as = 'input', className = '', ...props }) {
  const Component = as;
  const fieldProps = as === 'input' ? { type } : {};

  return (
    <label className={`app-input ${className}`.trim()}>
      {label && <span className="app-input-label">{label}</span>}
      <Component
        className="app-input-field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...fieldProps}
        {...props}
      />
    </label>
  );
}
