'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';

interface Message {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
}

export default function SupportPage() {
  const { user, isAuthenticated, isEmployee, isLoading } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployee)) router.push('/dashboard');
  }, [isAuthenticated, isEmployee, isLoading, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title-char', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.02, ease: 'power3.out', delay: 0.2 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setMessages([
      { id: '1', customerName: 'Alice Johnson', customerEmail: 'alice@example.com', subject: 'Question about class schedule', message: 'When is the next Ramen 101 class?', status: 'open', createdAt: new Date().toISOString() },
      { id: '2', customerName: 'Bob Smith', customerEmail: 'bob@example.com', subject: 'Order delivery issue', message: 'My order hasn\'t arrived yet', status: 'in-progress', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: '3', customerName: 'Carol White', customerEmail: 'carol@example.com', subject: 'Product inquiry', message: 'Do you sell noodle makers?', status: 'resolved', createdAt: new Date(Date.now() - 86400000).toISOString() },
    ]);
  }, []);

  if (isLoading) return <div className="min-h-screen bg-white pt-24 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>;
  if (!isAuthenticated || !isEmployee) return null;

  const filteredMessages = filter === 'all' ? messages : messages.filter(m => m.status === filter);
  const title = 'CUSTOMER SUPPORT';

  const statusColors = { open: 'bg-yellow-100 text-yellow-800', 'in-progress': 'bg-blue-100 text-blue-800', resolved: 'bg-green-100 text-green-800' };

  return (
    <div className="min-h-screen bg-white">
      <div ref={heroRef} className="relative bg-black text-white overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="relative py-12 sm:py-14 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-wider mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.02em] mb-2 break-words overflow-visible py-2">
              {title.split(' ').map((word, wordIndex) => (
                <span key={wordIndex} className="block overflow-visible py-0.5 whitespace-nowrap">
                  {word.split('').map((char, charIndex) => (
                    <span key={`${wordIndex}-${charIndex}`} className="hero-title-char inline-block will-change-transform">
                      {char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl">Respond to customer inquiries and support tickets</p>
          </div>
        </div>
      </div>

      <div className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'open', 'in-progress', 'resolved'].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {f.replace('-', ' ')} ({f === 'all' ? messages.length : messages.filter(m => m.status === f).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="bg-white border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-black text-black">{msg.subject}</h3>
                    <p className="text-sm text-gray-600">{msg.customerName} ({msg.customerEmail})</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded ${statusColors[msg.status]}`}>{msg.status.replace('-', ' ')}</span>
                </div>
                <p className="text-gray-700 mb-3">{msg.message}</p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                  <button className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
