import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react';
import { sendChat, fetchModels } from '../api/client';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export default function Chat({ connected }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m connected to your llama.cpp server. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (connected) {
      fetchModels().then(res => {
        if (res.success && res.data) {
          setModels(res.data);
        }
      });
    }
  }, [connected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedMessage(id);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !model) {
      if (!model) {
        toast.error('Please select a model first');
      }
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const chatMessages = [...messages, { role: 'user', content: userMessage }];

    try {
      const response = await sendChat(chatMessages, model);
      const assistantContent = response.choices?.[0]?.message?.content || 'No response';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!connected) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card text-center py-12">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">Not Connected</h3>
          <p className="text-gray-500">
            Unable to connect to the llama.cpp server. Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Chat</h2>
          <p className="text-gray-400 mt-1">Talk to your llama.cpp model</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="input w-64"
            disabled={!connected || models.length === 0}
          >
            <option value="">Select model...</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.id} {m.loaded ? '(loaded)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchModels().then(res => {
              if (res.success && res.data) setModels(res.data);
            })}
            className="btn-secondary"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="card min-h-[500px] max-h-[600px] overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div className={`p-4 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{msg.role}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {copiedMessage === idx ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}



        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          className="input flex-1 resize-none min-h-[50px] max-h-[150px]"
          disabled={loading}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="btn-primary h-[50px] px-6 flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          Send
        </button>
      </div>
    </div>
  );
}
