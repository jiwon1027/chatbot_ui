import { NextRequest, NextResponse } from 'next/server';
import { getServerLogger } from '../../../utils/serverLogger';

// 피드백 요청 인터페이스
interface FeedbackRequest {
  messageId: string;
  feedback: 'positive' | 'negative';
  userMessage: string;
  botMessage: string;
  timestamp: number;
  sessionId?: string;
}

// POST /api/feedback - 피드백 전송
export async function POST(request: NextRequest) {
  try {
    const serverLogger = getServerLogger();
    const body: FeedbackRequest = await request.json();
    
    // 요청 메타데이터 추출
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'Unknown';
    
    // 피드백 정보 로깅
    await serverLogger.info('FEEDBACK', '사용자 피드백 수신', {
      messageId: body.messageId,
      feedback: body.feedback,
      userMessage: body.userMessage,
      botMessage: body.botMessage,
      timestamp: new Date(body.timestamp).toISOString(),
      sessionId: body.sessionId,
      userAgent,
      ip
    });

    // TODO: 추후 외부 백엔드 API로 전송
    // const externalApiUrl = process.env.FEEDBACK_API_URL || 'https://your-backend-api.com/feedback';
    // const response = await fetch(externalApiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.API_TOKEN}`
    //   },
    //   body: JSON.stringify({
    //     messageId: body.messageId,
    //     feedback: body.feedback,
    //     userMessage: body.userMessage,
    //     botMessage: body.botMessage,
    //     timestamp: body.timestamp,
    //     sessionId: body.sessionId
    //   })
    // });

    return NextResponse.json({ 
      success: true, 
      message: '피드백이 성공적으로 전송되었습니다.',
      feedback: body.feedback
    });

  } catch (error) {
    const serverLogger = getServerLogger();
    await serverLogger.error('FEEDBACK', '피드백 전송 실패', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '피드백 전송에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
} 