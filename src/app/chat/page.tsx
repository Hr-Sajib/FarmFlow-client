/* eslint-disable */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Native TypeScript interfaces
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

interface Conversation {
  _id: string;
  userPhone: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentAssistantMessageRef = useRef<string>('');

  // Get userPhone from auth state
  const userPhone = useSelector((state: RootState) => state.auth.user?.userPhone);

  // Fetch chat conversations
  const fetchConversations = async () => {
    if (userPhone) {
      try {
        const response = await axios.get(`http://31.97.224.58:5000/chat/my-chats/${userPhone}`);
        console.log('ChatPage - Chat conversations:', response.data);
        if (response.data.data && Array.isArray(response.data.data)) {
          setConversations(response.data.data);
        }
      } catch (err) {
        console.error('ChatPage - Error fetching chat conversations:', err);
        setError('Failed to load conversations');
        toast.error('Failed to load conversations');
      }
    } else {
      console.warn('ChatPage - No userPhone available for fetching conversations');
      setError('User not authenticated');
      toast.error('User not authenticated');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userPhone]);

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
      console.log('ChatPage - Received chat:start event');
      setIsLoading(true);
      currentAssistantMessageRef.current = '';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '' }, // Placeholder for streaming
      ]);
    });

    socketRef.current.on('chat:chunk', (data: { text: string }) => {
      console.log('ChatPage - Received chat:chunk event:', data);
      currentAssistantMessageRef.current += data.text;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: currentAssistantMessageRef.current,
          createdAt: new Date(),
        };
        return newMessages;
      });
    });

    socketRef.current.on('chat:end', (data: { conversationId?: string }) => {
      console.log('ChatPage - Received chat:end event:', data);
      setIsLoading(false);
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }
      fetchConversations();
    });

    socketRef.current.on('chat:error', (data: { message: string; details?: unknown }) => {
      console.error('ChatPage - Received chat:error event:', data);
      setError(data.message || 'Failed to process chat request');
      toast.error(data.message || 'Failed to process chat request');
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
      console.warn('ChatPage - Empty input detected');
      toast.error('Please enter a message');
      return;
    }

    if (!userPhone) {
      setError('User not authenticated');
      console.error('ChatPage - No userPhone available');
      toast.error('User not authenticated');
      return;
    }

    const newMessage: Message = { role: 'user', content: input, createdAt: new Date() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setError(null);

    if (socketRef.current) {
      const payloadMessages = [...messages, newMessage].map(({ role, content }) => ({ role, content }));
      const payload = { userPhone, conversationId: currentConversationId || undefined, messages: payloadMessages };
      console.log('ChatPage - Sending WebSocket chat event with payload:', payload);
      socketRef.current.emit('chat', payload);
    } else {
      setError('WebSocket connection not established');
      console.error('ChatPage - WebSocket connection not established');
      toast.error('WebSocket connection not established');
    }
  };

  // Handle creating a new conversation
  const handleNewConversation = async () => {
    console.log('ChatPage - Creating new conversation');
    if (!userPhone) {
      setError('User not authenticated');
      console.error('ChatPage - No userPhone for new conversation');
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await axios.post('http://31.97.224.58:5000/chat', {
        userPhone,
        messages: [],
      });
      console.log('ChatPage - New conversation created:', response.data);
      const newConversationId = response.data.data.conversationId;
      setCurrentConversationId(newConversationId);
      setMessages([]);
      await fetchConversations();
      toast.success('New conversation created');
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('ChatPage - Error creating new conversation:', err);
      setError('Failed to create new conversation');
      toast.error('Failed to create new conversation');
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    console.log('ChatPage - Selected conversation:', conversation._id);
    setMessages(conversation.messages);
    setCurrentConversationId(conversation._id);
    setIsSidebarOpen(false);
  };

  // Handle deleting a conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await axios.delete(`http://31.97.224.58:5000/chat/${conversationId}`);
      console.log('ChatPage - Conversation deleted:', response.data);
      toast.success(response.data.message || 'Conversation deleted successfully');
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      await fetchConversations();
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('ChatPage - Error deleting conversation:', err);
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to delete conversation');
      toast.error(axiosError.response?.data?.message || 'Failed to delete conversation');
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

  // Helper to generate conversation title from first message
  const getConversationTitle = (messages: Message[]) => {
    if (!messages.length) return 'Untitled';
    const firstMessage = messages[0].content;
    return firstMessage.split(' ').slice(0, 5).join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  // Helper to generate conversation preview
  const getConversationPreview = (messages: Message[]) => {
    if (!messages.length) return '';
    const firstMessage = messages[0].content;
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).split('/').join('-');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 pt-12">
      {/* Hamburger menu for mobile */}
      <div className=' w-full'>
        <button
        className="sm:hidden text-gray-700 focus:outline-none mb-4"
        onClick={toggleSidebar}
        aria-label="Toggle chat history"
      >►
      </button>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-3">
        {/* Chat history for desktop */}
        <div className="hidden sm:block rounded-l-lg bg-white w-full sm:w-[45%] p-5 shadow-md">
          <div className="flex justify-between items-center mb-5">
            <p className="text-xl font-semibold text-green-800">Chat History</p>
            <button
              onClick={handleNewConversation}
              className="bg-green-200 pb-0.5 w-7 h-7 flex items-center justify-center rounded-full text-2xl"
            >
              +
            </button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-gray-500">No conversations found.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`bg-green-100 p-3 rounded-lg flex mb-2 cursor-pointer hover:bg-green-200 transition-colors duration-200 ${
                  conv._id === currentConversationId ? 'border-2 border-green-500' : ''
                }`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="w-full">
                  <div className="flex justify-between w-full">
                    <p className="font-semibold">{getConversationTitle(conv.messages)}</p>
                    <button
                      onClick={() => handleDeleteConversation(conv._id)}
                      className="bg-red-100 px-1 rounded-sm hover:bg-red-200"
                    >
                      🪣
                    </button>
                  </div>
                  <p className="my-1">{getConversationPreview(conv.messages)}</p>
                  <span className="text-sm bg-green-900 text-white px-2 rounded-md">{formatDate(conv.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 sm:hidden"
            >
              <div className="flex flex-col p-5 space-y-4">
                <div className="flex justify-between items-center mb-5">
                  <p className="text-xl font-semibold text-green-800">Chat History</p>
                  <button
                    onClick={toggleSidebar}
                    className="text-gray-700"
                    aria-label="Close sidebar"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {conversations.length === 0 ? (
                  <p className="text-gray-500">No conversations found.</p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv._id}
                      className={`bg-green-100 p-3 rounded-lg flex mb-2 cursor-pointer hover:bg-green-200 transition-colors duration-200 ${
                        conv._id === currentConversationId ? 'border-2 border-green-500' : ''
                      }`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="w-full">
                        <div className="flex justify-between w-full">
                          <p className="font-semibold">{getConversationTitle(conv.messages)}</p>
                          <button
                            onClick={() => handleDeleteConversation(conv._id)}
                            className="bg-red-100 px-1 rounded-sm hover:bg-red-200"
                          >
                            🪣
                          </button>
                        </div>
                        <p className="my-1">{getConversationPreview(conv.messages)}</p>
                        <span className="text-sm bg-green-900 text-white px-2 rounded-md">{formatDate(conv.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={handleNewConversation}
                  className="bg-green-200 pb-0.5 w-full py-2 rounded-md text-lg font-semibold hover:bg-green-300"
                >
                  New Conversation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area */}
        <div className="w-full bg-white rounded-r-lg sm:rounded-l-lg shadow-md flex flex-col h-[80vh]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">Start a conversation or select one from history!</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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