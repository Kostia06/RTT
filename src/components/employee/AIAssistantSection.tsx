'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  images?: string[];
  functionCall?: {
    function: string;
    arguments: any;
  };
  link?: string;
}

interface ConfirmationDialog {
  isOpen: boolean;
  action: {
    function: string;
    arguments: any;
  } | null;
  preview: string;
}

export default function AIAssistantSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        "👋 Hi! I can help you:\n\n• Create/update/delete recipes\n• Add/update/delete products\n• Update inventory\n• Approve users (admin)\n\nJust describe what you need!",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationDialog>({
    isOpen: false,
    action: null,
    preview: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() && selectedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      images: selectedImages.map((file) => URL.createObjectURL(file)),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Convert images to base64
      const imageData = await Promise.all(
        selectedImages.map(async (file) => {
          const base64 = await convertImageToBase64(file);
          return {
            mimeType: file.type,
            data: base64,
          };
        })
      );

      setSelectedImages([]);

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          images: imageData,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.type === 'function_call') {
        // Show confirmation dialog
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message,
          functionCall: {
            function: data.function,
            arguments: data.arguments,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        setConfirmation({
          isOpen: true,
          action: {
            function: data.function,
            arguments: data.arguments,
          },
          preview: data.message,
        });
      } else if (data.type === 'success') {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message,
          link: data.link,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.message,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmation.action) return;

    setConfirmation({ isOpen: false, action: null, preview: '' });
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: confirmation.action,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.message,
        link: data.link,
      };

      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmation({ isOpen: false, action: null, preview: '' });

    const cancelMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'No problem! Is there anything else I can help you with?',
    };

    setMessages((prev) => [...prev, cancelMessage]);
  };

  return (
    <>
      <div className="ai-assistant-section bg-white border border-gray-300 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <h2 className="text-sm font-bold">AI Assistant</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col">
          {/* Messages */}
          <div className="overflow-y-auto p-3 space-y-3 bg-white min-h-[200px] max-h-[300px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded p-3 ${
                      message.type === 'user'
                        ? 'bg-black text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className={`text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-bold ${
                      message.type === 'user'
                        ? 'prose-invert prose-strong:text-white'
                        : 'prose-strong:text-black'
                    }`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.images && message.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded overflow-hidden">
                            <Image src={img} alt="" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    {message.link && (
                      <a
                        href={message.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors rounded"
                      >
                        View Result
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 bg-white">
              <p className="text-xs font-bold text-gray-500 mb-2">
                Attached Images ({selectedImages.length})
              </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedImages.map((file, idx) => (
                    <div key={idx} className="relative flex-shrink-0">
                      <div className="w-20 h-20 relative rounded overflow-hidden border-2 border-gray-300">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-2 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-gray-300 hover:border-black transition-colors text-gray-600"
                  disabled={isLoading}
                  title="Attach images"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  placeholder="Ask me to create a recipe or product..."
                  className="flex-1 px-3 py-2 border border-gray-300 focus:border-black focus:outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || (!inputValue.trim() && selectedImages.length === 0)}
                  className="flex-shrink-0 px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Confirmation Dialog */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-lg w-full border-2 border-black shadow-2xl">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black">Confirm Action</h3>
                  <p className="text-sm text-gray-500 mt-1">Please review before proceeding</p>
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-bold prose-strong:text-black">
                  <ReactMarkdown>{confirmation.preview}</ReactMarkdown>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-4 border-2 border-black text-black font-bold hover:bg-gray-100 transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-4 bg-black text-white font-bold hover:bg-gray-800 transition-colors text-base"
                >
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
