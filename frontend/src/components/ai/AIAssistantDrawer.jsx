import React, { useState } from 'react';
import api from '../../api/client';
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

export const AIAssistantDrawer = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your **Campus Asset & Inventory AI Assistant**. Ask me anything about laboratory equipment status, low stock consumables, maintenance schedules, or institutional asset distribution!',
    },
  ]);

  const presetQuestions = [
    'Which assets are currently under maintenance?',
    'Which items are low in stock or depleted?',
    'Which laboratory has the highest number of assets?',
    'Show overdue asset returns requiring attention',
    'Provide a quick institutional summary',
  ];

  const handleAsk = async (qText) => {
    const query = qText || question;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', { question: query });
      const answer = res.data.answer || 'No response available.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, mode: res.data.mode }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Error querying assistant**: ${err.response?.data?.message || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(3px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '450px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        height: '100%',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.45rem', borderRadius: '8px' }}>
              <Sparkles size={20} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                AI Asset Assistant
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
                Real-time MongoDB Knowledge Grounding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.3rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset Prompt Suggestions */}
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Suggested Queries:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {presetQuestions.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(preset)}
                className="btn-secondary"
                style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'flex-start',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#4338ca',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bot size={16} />
                </div>
              )}
              <div
                style={{
                  backgroundColor: msg.role === 'user' ? '#2563eb' : '#f1f5f9',
                  color: msg.role === 'user' ? '#ffffff' : '#0f172a',
                  padding: '0.75rem 0.95rem',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <UserIcon size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', color: '#64748b', fontSize: '0.8rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#4338ca',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={16} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>Analyzing institutional database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              placeholder="Ask about assets, stock, or maintenance..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary"
              style={{ padding: '0.55rem 0.85rem' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
