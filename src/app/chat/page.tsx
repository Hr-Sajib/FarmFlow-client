'use client';

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Native TypeScript interfaces
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentAssistantMessageRef = useRef<string>('');

  // Initialize WebSocket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5100', {
      reconnection: true,
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('ChatPage - Socket.IO connected:', socketRef.current?.id);
    });

    socketRef.current.on('chat:start', () => {
      setIsLoading(true);
      currentAssistantMessageRef.current = '';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '' }, // Placeholder for streaming
      ]);
    });

    socketRef.current.on('chat:chunk', (data: { text: string }) => {
      currentAssistantMessageRef.current += data.text;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: currentAssistantMessageRef.current,
        };
        return newMessages;
      });
    });

    socketRef.current.on('chat:end', () => {
      setIsLoading(false);
    });

    socketRef.current.on('chat:error', (data: { message: string; details?: unknown }) => {
      setError(data.message || 'Failed to process chat request');
      setIsLoading(false);
      setMessages((prev) => prev.slice(0, -1)); // Remove placeholder
    });

    socketRef.current.on('disconnect', () => {
      console.log('ChatPage - Socket.IO disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please enter a message');
      return;
    }

    const newMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setError(null);

    if (socketRef.current) {
      socketRef.current.emit('chat', { messages: [...messages, newMessage] });
    }
  };

  // Markdown components with proper typing
  const markdownComponents: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-xl font-bold text-gray-800 mt-4 mb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-lg font-semibold text-gray-800 mt-3 mb-1" {...props}>
        {children}
      </h2>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-2" {...props}>
        {children}
      </ol>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-bold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-2" {...props}>
        {children}
      </p>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 pt-9">
      {/* <h1 className="text-3xl font-bold text-green-800 mb-6">AI Powered Chatbot</h1> */}
     <div className='w-full flex gap-3'>
        <div className='rounded-l-lg bg-white w-[45%] p-5 shadow-md'>
            <p className='text-xl font-semibold text-green-800 mb-5'>Chat History</p>

            {/* histories  */}

            <div className='bg-green-100 p-3 rounded-lg flex'>
                <div>
                    <p className='font-semibold'>About rice growth</p>
                    <p className='my-1'>What are the main purposes of rapid rice growth technolog...</p>
                    <span className='text-sm bg-green-900 text-white px-2 rounded-md'>12-08-2025</span>
                </div>
                <div>
                    {/* options icon */}
                </div>
            </div>
        
        </div>
        <div className="w-full bg-white rounded-r-lg shadow-md flex flex-col h-[80vh]">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
                <p className="text-gray-500 text-center">Start a conversation!</p>
            ) : (
                messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                    <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                        msg.role === 'user'
                        ? 'bg-green-800 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                    >
                    {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                        >
                            {msg.content}
                        </ReactMarkdown>
                        </div>
                    ) : (
                        <p>{msg.content}</p>
                    )}
                    </div>
                </div>
                ))
            )}
            
            <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            <div className="flex gap-2">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isLoading}
                />
                <button
                type="submit"
                disabled={isLoading}
                className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                Send
                </button>
            </div>
            </form>
        </div>
     </div>
    </div>
  );
};

export default ChatPage;