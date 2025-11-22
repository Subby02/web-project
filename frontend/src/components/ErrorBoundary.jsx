import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>오류가 발생했습니다</h1>
          <p>
            {this.state.error?.toString() || '알 수 없는 오류'}
          </p>
          <button
            className="error-boundary-button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            새로고침
          </button>
          <details className="error-boundary-details">
            <summary className="error-boundary-summary">오류 상세 정보</summary>
            <pre className="error-boundary-pre">
              {this.state.error?.stack || this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

