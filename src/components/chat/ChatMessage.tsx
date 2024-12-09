import { format } from 'date-fns';
import { Bot } from 'lucide-react';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-sm font-medium text-teal-600">You</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
          )}
        </div>
        
        <div>
          <div
            className={`rounded-lg px-4 py-2 ${
              isUser
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {format(message.timestamp, 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}