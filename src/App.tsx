import { Component, ReactNode } from 'react';
import ChatBot from './components/ChatBot';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: (error: Error) => ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback: (error: Error) => ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}

function ErrorFallback(error: Error) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#dc3545',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          챗봇 로딩 오류
        </h1>
        
        <p style={{
          color: '#6c757d',
          fontSize: '16px',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          죄송합니다. 챗봇을 로드하는 중 오류가 발생했습니다.
        </p>
        
        <details style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            기술적 세부사항
          </summary>
          <pre style={{
            fontSize: '12px',
            color: '#495057',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0
          }}>
            {error.message}
            {error.stack && `\n\n스택 추적:\n${error.stack}`}
          </pre>
        </details>
        
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          페이지 새로고침
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="antialiased">
      <ErrorBoundary fallback={ErrorFallback}>
        <ChatBot />
      </ErrorBoundary>
    </div>
  );
}

export default App; 