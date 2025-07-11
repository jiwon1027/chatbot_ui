import { useState, useRef, useEffect } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import TextareaAutosize from 'react-textarea-autosize';
import { logger, apiLogger, uiLogger, errorLogger } from '../utils/logger';
import customApiLogger from '../utils/fileLogger';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  feedback?: 'positive' | 'negative';
}

// 나비 캐릭터 이미지 (인라인 SVG로 간단하게 표현)
const NaviAvatar = ({ size = 40 }: { size?: number }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: '#4A90E2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
    boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* 얼굴 */}
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#FFE4B5',
      borderRadius: '50%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 모자 */}
      <div style={{
        position: 'absolute',
        top: '0px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: '30%',
        backgroundColor: '#4A90E2',
        borderRadius: '20px 20px 0 0',
        border: '1px solid #357ABD'
      }}></div>
      
      {/* 눈 */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '30%',
        width: '4px',
        height: '4px',
        backgroundColor: '#333',
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '30%',
        width: '4px',
        height: '4px',
        backgroundColor: '#333',
        borderRadius: '50%'
      }}></div>
      
      {/* 입 */}
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '8px',
        height: '4px',
        borderRadius: '0 0 8px 8px',
        backgroundColor: '#FF6B6B'
      }}></div>
      
      {/* 볼 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20%',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#FFB6C1',
        opacity: 0.7
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '20%',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#FFB6C1',
        opacity: 0.7
      }}></div>
    </div>
  </div>
);

// 애니메이션 캐릭터 컴포넌트 (ico_chat.gif 사용)
const AnimatedCharacter = ({ size = 60 }: { size?: number }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <img 
      src="/ico_chat.gif" 
      alt="나비 캐릭터"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        filter: 'drop-shadow(0 8px 8px rgba(74, 144, 226, 0.2))'
      }}
    />
  </div>
);

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<number | null>(null);

  // 환경 변수 안전성 검사
  const validateEnvironment = () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://172.20.23.104:3000';
      const endpoint = import.meta.env.VITE_API_ENDPOINT || '/api/v1/chat/completions';
      
      logger.info('환경 변수 검증 완료', { baseUrl, endpoint });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 환경 변수 오류';
      errorLogger.error('환경 변수 검증 실패', { error: errorMessage });
      setInitError(errorMessage);
      return false;
    }
  };

  // 컴포넌트 마운트 로깅
  useEffect(() => {
    try {
      logger.info('ChatBot 컴포넌트가 마운트되었습니다');
      validateEnvironment();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '초기화 오류';
      errorLogger.error('ChatBot 초기화 실패', { error: errorMessage });
      setInitError(errorMessage);
    }
    
    return () => {
      logger.info('ChatBot 컴포넌트가 언마운트되었습니다');
      // 타이핑 효과 정리
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, []);

  // 초기화 오류가 있는 경우 에러 화면 표시
  if (initError) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: '#fff',
        border: '2px solid #dc3545',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#dc3545', margin: '0 0 10px 0', fontSize: '16px' }}>
            챗봇 초기화 오류
          </h3>
          <p style={{ color: '#6c757d', fontSize: '14px', margin: '0 0 15px 0' }}>
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  // 메시지 변경 로깅
  useEffect(() => {
    if (messages.length > 0) {
      logger.debug(`메시지 개수 변경: ${messages.length}개`, {
        latestMessage: messages[messages.length - 1]
      });
    }
  }, [messages]);

  const scrollToBottom = () => {
    uiLogger.debug('메시지 영역 스크롤을 맨 아래로 이동');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    const sendMessage = async () => {
    let startTime = 0;
    let fullApiUrl = '';
    
          logger.time('메시지 전송 처리');
      logger.info('메시지 전송 시도', { input: input.trim() });
      
      if (!input.trim()) {
        logger.warn('빈 메시지는 전송할 수 없습니다');
        return;
      }

    // 진행 중인 타이핑 효과 정리
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      logger.debug('이전 타이핑 효과 정리');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: Date.now(),
    };

    logger.info('사용자 메시지 생성', userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      logger.debug('메시지 목록 업데이트', { totalMessages: newMessages.length });
      return newMessages;
    });
    
    const originalInput = input;
    setInput('');
    setIsTyping(true);
    uiLogger.debug('타이핑 상태 시작');

    try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://172.20.23.104:3000';
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || '/api/v1/chat/completions';
      const modelName = import.meta.env.VITE_MODEL_NAME || 'gemma3:1b';
      fullApiUrl = `${apiBaseUrl}${apiEndpoint}`;

      const requestPayload = {
        model: modelName,
        messages: [
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: originalInput,
          },
        ],
        stream: false
      };

      apiLogger.group('API 요청 처리');
      apiLogger.info('API 요청 준비', {
        endpoint: fullApiUrl,
        model: modelName,
        messageCount: requestPayload.messages.length
      });

      apiLogger.time('API 응답 시간');
      startTime = performance.now();
      
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      apiLogger.timeEnd('API 응답 시간');

      apiLogger.info('API 응답 수신', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // API 응답 파싱 및 로깅
      const data = await response.json();
      apiLogger.info('API 응답 파싱 완료', {
        model: data.model,
        token_count: data.token_count,
        responseLength: data.response?.length || 0,
        responseData: data
      });
      
      // API 성공 로그 기록
      customApiLogger.logApiCall(fullApiUrl, 'POST', duration, {
        model: data.model,
        token_count: data.token_count,
        responseLength: data.response?.length || 0
      });
      
      apiLogger.groupEnd();

      // 새로운 응답 포맷: {"response": {답변}, "model": "gemm3:27b", "token_count": 0}
      const fullContent = data.response || '죄송합니다. 응답을 받을 수 없습니다.';
      const botMessageId = (Date.now() + 1).toString();

      // 초기 빈 메시지 생성
      const initialBotMessage: Message = {
        id: botMessageId,
        content: '',
        sender: 'bot',
        timestamp: Date.now(),
      };

      // 메시지 목록에 초기 메시지 추가
      setMessages(prev => [...prev, initialBotMessage]);

      // 타이핑 효과 구현
      let currentIndex = 0;
      
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullContent.length) {
          const currentContent = fullContent.substring(0, currentIndex + 1);
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: currentContent }
                : msg
            )
          );
          currentIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          logger.info('타이핑 효과 완료', { 
            messageId: botMessageId,
            finalContent: fullContent,
            contentLength: fullContent.length,
            model: data.model,
            tokenCount: data.token_count
          });
        }
      }, parseInt(import.meta.env.VITE_TYPING_SPEED || '50')); // 타이핑 속도 설정 가능

    } catch (error) {
      const errorDuration = performance.now() - startTime;
      
      errorLogger.error('API 요청 실패', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        input: originalInput,
        timestamp: new Date().toISOString()
      });
      
      // API 에러 로그 기록
      customApiLogger.logApiError(fullApiUrl, 'POST', error, Math.round(errorDuration));
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'bot',
        timestamp: Date.now(),
      };
      
      logger.warn('에러 메시지 생성', errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      uiLogger.debug('타이핑 상태 종료');
      logger.timeEnd('메시지 전송 처리');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      uiLogger.debug('Enter 키 입력 (메시지 전송)');
      sendMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      uiLogger.debug('Shift+Enter 키 입력 (줄바꿈)');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (newValue.length % 50 === 0 && newValue.length > 0) {
      uiLogger.debug(`입력 텍스트 길이: ${newValue.length}자`);
    }
  };

  // 피드백 전송 함수
  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      logger.info('피드백 전송 시도', { messageId, feedback });
      
      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        logger.warn('메시지를 찾을 수 없습니다', { messageId });
        return;
      }

      // 이전 사용자 메시지 찾기
      const messageIndex = messages.findIndex(msg => msg.id === messageId);
      const userMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;

      // 피드백 API 전송
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback,
          userMessage: userMessage?.content || '',
          botMessage: message.content,
          timestamp: message.timestamp,
          sessionId: logger.getSessionId()
        }),
      });

      if (response.ok) {
        // UI 업데이트
        setMessages(prev =>
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, feedback }
              : msg
          )
        );
        
        logger.info('피드백 전송 성공', { messageId, feedback });
      } else {
        throw new Error('피드백 전송 실패');
      }
    } catch (error) {
      logger.error('피드백 전송 오류', error);
    }
  };

  // 마크다운 복사 함수
  const handleCopyMarkdown = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      logger.info('마크다운 복사 성공');
      // TODO: 복사 완료 알림 표시
    } catch (error) {
      logger.error('마크다운 복사 실패', error);
    }
  };

  // 시간 포맷팅 함수
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${ampm} ${displayHours}:${displayMinutes}`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        boxShadow: '0 2px 10px rgba(74, 144, 226, 0.15)',
        borderRadius: '24px',
        margin: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NaviAvatar size={52} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: '600', 
              color: '#ffffff',
              margin: '0',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              나비
            </h1>
            <div style={{ 
              fontSize: '15px', 
              color: '#E3F2FD',
              margin: '2px 0 4px 0'
            }}>
              나이스페이 가맹점관리자 비서
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                boxShadow: '0 0 6px rgba(76, 175, 80, 0.6)'
              }}></div>
              <span style={{ 
                fontSize: '13px', 
                color: '#E8F5E8'
              }}>
                온라인
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        padding: '24px 16px',
        backgroundColor: '#f8fafc',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(74, 144, 226, 0.05) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <AnimatedCharacter size={80} />
            <h3 style={{ 
              fontSize: '22px', 
              fontWeight: '600', 
              color: '#2d3748', 
              margin: '20px 0 8px 0'
            }}>
              안녕하세요! 나비입니다 👋
            </h3>
            <p style={{ 
              color: '#718096', 
              margin: '0',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              나이스페이먼츠 관련 궁금한 것이 있으시면<br />
              언제든 편하게 물어보세요!
            </p>
            <div style={{
              marginTop: '20px',
              padding: '12px 20px',
              backgroundColor: '#EBF4FF',
              borderRadius: '20px',
              border: '1px solid #BEE3F8',
              fontSize: '14px',
              color: '#2B6CB0'
            }}>
              💡 결제, 정산, API 연동 등 무엇이든 도와드릴게요!
            </div>
          </div>
        )}
        
        {messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                marginBottom: '24px',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                opacity: '0',
                animation: 'fadeIn 0.3s ease-out forwards',
                position: 'relative'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                maxWidth: '85%',
                position: 'relative'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  marginLeft: !isUser ? '12px' : '0',
                  position: 'relative'
                }}>
                  <div style={{
                    maxWidth: '280px',
                    padding: '14px 18px',
                    borderRadius: '20px',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                    backgroundColor: isUser ? '#4A90E2' : '#ffffff',
                    color: isUser ? 'white' : '#374151',
                    borderBottomRightRadius: isUser ? '6px' : '20px',
                    borderBottomLeftRadius: isUser ? '20px' : '6px',
                    boxShadow: isUser 
                      ? '0 4px 12px rgba(74, 144, 226, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    {!isUser && (
                      <div style={{ 
                        position: 'absolute',
                        left: '-25px',
                        top: '-15px',
                        zIndex: 1,
                        opacity: 0.8,
                        overflow: 'hidden',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px'
                      }}>
                        <AnimatedCharacter size={50} />
                      </div>
                    )}
                    <MessageContent content={message.content} />
                  </div>
                  
                  {/* 시간 표시 */}
                  <div style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '4px',
                    textAlign: isUser ? 'right' : 'left',
                    marginLeft: !isUser ? '4px' : '0'
                  }}>
                    {formatTime(message.timestamp)}
                  </div>
                  
                  {/* 피드백 버튼 (봇 메시지에만) */}
                  {!isUser && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px',
                      marginLeft: '4px'
                    }}>
                      <button
                        onClick={() => handleFeedback(message.id, 'positive')}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: message.feedback === 'positive' ? '#dcfce7' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          color: message.feedback === 'positive' ? '#16a34a' : '#64748b'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = message.feedback === 'positive' ? '#dcfce7' : '#e2e8f0';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = message.feedback === 'positive' ? '#dcfce7' : '#f8fafc';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img src="/icons/thumbs-up.svg" alt="좋아요" style={{ width: '16px', height: '16px' }} />
                      </button>
                      
                      <button
                        onClick={() => handleFeedback(message.id, 'negative')}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: message.feedback === 'negative' ? '#fee2e2' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          color: message.feedback === 'negative' ? '#dc2626' : '#64748b'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = message.feedback === 'negative' ? '#fee2e2' : '#e2e8f0';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = message.feedback === 'negative' ? '#fee2e2' : '#f8fafc';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img src="/icons/thumbs-down.svg" alt="싫어요" style={{ width: '16px', height: '16px' }} />
                      </button>
                      
                      <button
                        onClick={() => handleCopyMarkdown(message.content)}
                        style={{
                          padding: '8px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          color: '#64748b'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <img src="/icons/copy.svg" alt="복사" style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease-out',
            position: 'relative',
            marginLeft: '12px'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              borderBottomLeftRadius: '6px',
              padding: '14px 18px',
              maxWidth: '280px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'visible'
            }}>
              <div style={{ 
                position: 'absolute',
                left: '-25px',
                top: '-15px',
                zIndex: 1,
                opacity: 0.8,
                overflow: 'hidden',
                borderRadius: '50%',
                width: '50px',
                height: '50px'
              }}>
                <AnimatedCharacter size={50} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite 0.1s'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '50%',
                  animation: 'bounce 1s infinite 0.2s'
                }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        backgroundColor: 'transparent',
        padding: '16px 20px 32px 20px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          padding: '8px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #e2e8f0',
          transition: 'all 0.2s'
        }}>
          <div style={{
            flex: '1',
            padding: '8px 16px'
          }}>
            <TextareaAutosize
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              style={{
                width: '100%',
                resize: 'none',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'inherit',
                color: '#2d3748',
                lineHeight: '1.5'
              }}
              minRows={1}
              maxRows={4}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              backgroundColor: input.trim() && !isTyping ? '#4A90E2' : '#e2e8f0',
              marginRight: '4px',
              marginBottom: '4px'
            }}
            onMouseOver={(e) => {
              if (input.trim() && !isTyping) {
                e.currentTarget.style.backgroundColor = '#357ABD';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (input.trim() && !isTyping) {
                e.currentTarget.style.backgroundColor = '#4A90E2';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <span style={{ 
              fontSize: '18px',
              color: input.trim() && !isTyping ? '#ffffff' : '#9ca3af',
              transform: 'rotate(-45deg)',
              marginLeft: '2px'
            }}>▲</span>
          </button>
        </div>
      </div>

      {/* CSS Animations - 애니메이션은 globals.css에 정의되어 있음 */}
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  
  let lastIndex = 0;
  const parts = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textPart = content.slice(lastIndex, match.index);
      parts.push(
        <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{
          __html: textPart.replace(inlineCodeRegex, '<code style="background-color: rgba(74, 144, 226, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 14px; color: #2B6CB0;">$1</code>')
        }} />
      );
    }

    const language = match[1] || 'javascript';
    const code = match[2];
    
    parts.push(
      <div key={`code-${match.index}`} style={{ margin: '12px 0' }}>
        <Highlight theme={themes.github} code={code} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre 
              style={{
                ...style,
                backgroundColor: '#1e293b',
                color: 'white',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                overflowX: 'auto',
                border: '1px solid #334155',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const textPart = content.slice(lastIndex);
    parts.push(
      <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{
        __html: textPart.replace(inlineCodeRegex, '<code style="background-color: rgba(74, 144, 226, 0.1); padding: 2px 6px; border-radius: 4px; font-size: 14px; color: #2B6CB0;">$1</code>')
      }} />
    );
  }

  return <div style={{ whiteSpace: 'pre-wrap' }}>{parts}</div>;
};

export default ChatBot; 