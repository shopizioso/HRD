import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    // Store in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push({
      timestamp: new Date().toISOString(),
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });

    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }

    localStorage.setItem('app_errors', JSON.stringify(errors));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          padding: '24px',
          backgroundColor: 'var(--bg)',
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '40px',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '3rem',
              margin: '0 0 16px',
            }}>⚠️</h1>
            
            <h2 style={{
              margin: '0 0 12px',
              color: 'var(--text)',
            }}>
              Terjadi Kesalahan
            </h2>
            
            <p style={{
              margin: '0 0 24px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}>
              Aplikasi mengalami kesalahan yang tidak terduga. Tim kami telah dicatat dan akan menginvestigasi masalah ini.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: 'var(--surface-strong)',
                borderRadius: '8px',
                textAlign: 'left',
                maxHeight: '300px',
                overflow: 'auto',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--danger)',
                }}>
                  Detail Error (Development Only)
                </summary>
                <pre style={{
                  margin: '12px 0 0',
                  fontSize: '0.85rem',
                  overflow: 'auto',
                  color: 'var(--text-muted)',
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = 'var(--primary)'}
              >
                Coba Lagi
              </button>
              
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--surface-strong)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--border)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--surface-strong)'}
              >
                Muat Ulang Halaman
              </button>
            </div>

            {this.state.errorCount > 3 && (
              <p style={{
                marginTop: '24px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}>
                ⚠️ Error telah terjadi {this.state.errorCount} kali. Silakan clear cache browser dan coba lagi.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export class AsyncErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: '8px',
          color: 'var(--danger)',
        }}>
          <strong>Error:</strong> Gagal memuat komponen. Silakan refresh halaman.
        </div>
      );
    }

    return this.props.children;
  }
}
