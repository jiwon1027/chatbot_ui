'use client';

import { useEffect } from 'react';
import { errorLogger } from '../utils/logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    errorLogger.error('전역 에러 발생', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString()
    });
    
    // 콘솔에도 출력 (디버깅용)
    console.error('전역 에러:', error);
  }, [error]);

  return (
    <html>
      <body>
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
              애플리케이션 오류
            </h1>
            
            <p style={{
              color: '#6c757d',
              fontSize: '16px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              죄송합니다. 예상치 못한 오류가 발생했습니다.
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
                {error.digest && `\n\n다이제스트: ${error.digest}`}
              </pre>
            </details>
            
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                marginRight: '12px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              다시 시도
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#545b62';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              페이지 새로고침
            </button>
          </div>
          
          <p style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            문제가 지속되면 개발자 도구(F12)를 열어 콘솔 탭에서 더 자세한 정보를 확인하세요.
          </p>
        </div>
      </body>
    </html>
  );
} 