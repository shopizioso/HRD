export default function AppButton({ children, variant = 'primary', size = 'md', className = '', as = 'button', ...props }) {
  const Component = as;
  return (
    <Component className={`app-button app-button-${variant} app-button-${size} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}
