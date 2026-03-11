import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container" style={{ 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', 
          alignItems: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' 
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Bir Şeyler Ters Gitti</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '300px' }}>
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 32px' }}
          >
            Yeniden Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
