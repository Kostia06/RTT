'use client';

import { useState, useEffect } from 'react';
import { ContactMessage } from '@/types/message';

export default function MessagesSection() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setError(null);
      const url = filter === 'all' ? '/api/messages' : `/api/messages?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        setError(data.details || data.error || 'Failed to load messages');
        console.error('API Error:', data);
      }
    } catch (error) {
      setError('Network error: ' + (error instanceof Error ? error.message : 'Unknown'));
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status });
        }
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      updateMessageStatus(message.id, 'read');
    }
  };

  const newMessagesCount = messages.filter(m => m.status === 'new').length;
  const filteredMessages = filter === 'all' ? messages : messages.filter(m => m.status === filter);

  if (loading) {
    return (
      <div className="bg-white p-6 shadow-sm border border-gray-200">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-sm">
              📧
            </div>
            <div>
              <h2 className="text-lg font-bold">Customer Messages</h2>
              <p className="text-xs text-gray-500">
                {newMessagesCount} new {newMessagesCount === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'new'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            New ({messages.filter(m => m.status === 'new').length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({messages.filter(m => m.status === 'read').length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === 'archived'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Archived ({messages.filter(m => m.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 mx-4 mt-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-red-900">Error Loading Messages</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                The contact_messages table may not exist yet. Run the SQL migration in your Supabase dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[400px] max-h-[600px]">
        {/* Messages List */}
        <div className="border-r border-gray-200 overflow-y-auto">
          {error ? (
            <div className="p-8 text-center text-gray-400">
              <p>Unable to load messages</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${message.status === 'new' ? 'bg-yellow-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-black truncate">
                          {message.name}
                        </p>
                        {message.status === 'new' && (
                          <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1">{message.email}</p>
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {message.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="overflow-y-auto bg-gray-50">
          {selectedMessage ? (
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-black mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">From:</span> {selectedMessage.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{' '}
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold uppercase ${
                            selectedMessage.status === 'new'
                              ? 'bg-red-100 text-red-800'
                              : selectedMessage.status === 'read'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedMessage.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded mb-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-4 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                  >
                    Reply via Email
                  </a>
                  {selectedMessage.status !== 'archived' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold hover:border-black transition-colors"
                    >
                      Archive
                    </button>
                  )}
                  {selectedMessage.status === 'archived' && (
                    <button
                      onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-bold hover:border-black transition-colors"
                    >
                      Unarchive
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
