import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader, AlertCircle, Database, Calculator, Search } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ projectId }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm your AI assistant for this board search. I have access to **real-time tools** to analyze your board.\n\n**I can:**\n- Calculate diversity metrics from your database\n- Search for matching candidates\n- Analyze board gaps\n- Generate insights with actual data\n\nWhat would you like me to do?"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinkingSteps]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setThinkingSteps([]);

    try {
      const response = await axios.post(
        `/api/projects/${projectId}/chat`,
        { message: userMessage },
        { withCredentials: true }
      );

      // Show thinking steps if any
      if (response.data.thinking_steps && response.data.thinking_steps.length > 0) {
        setThinkingSteps(response.data.thinking_steps);
        // Brief delay to show thinking
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        toolCalls: response.data.tool_calls
      }]);
      
      setThinkingSteps([]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => prev.slice(0, -1));
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Calculate our diversity metrics",
    "What are our biggest gaps?",
    "Search for AI/ML candidates",
    "Analyze our board composition"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-20rem)]">
      {messages.length === 1 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Quick Actions:</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action)}
                className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl 
                  text-left text-sm text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 
                  transition-all duration-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-6 py-5 shadow-xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'bg-slate-800/95 border border-slate-700'
              }`}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400">AI Agent</span>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <span className="ml-auto text-xs text-emerald-400">
                        ✓ Used {message.toolCalls.length} tool{message.toolCalls.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
                
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: (props) => <h1 className="text-2xl font-black text-white mb-4 mt-6 pb-2 border-b border-cyan-500/30" {...props} />,
                        h2: (props) => <h2 className="text-xl font-bold text-cyan-400 mb-3 mt-6" {...props} />,
                        h3: (props) => <h3 className="text-lg font-semibold text-blue-300 mb-2 mt-4" {...props} />,
                        p: (props) => <p className="text-slate-200 mb-4 leading-relaxed" {...props} />,
                        ul: (props) => <ul className="space-y-2 mb-4 ml-1" {...props} />,
                        ol: (props) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside" {...props} />,
                        li: (props) => (
                          <li className="text-slate-200 leading-relaxed flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">•</span>
                            <span className="flex-1">{props.children}</span>
                          </li>
                        ),
                        strong: (props) => <strong className="font-bold text-white" {...props} />,
                        em: (props) => <em className="italic text-cyan-300" {...props} />,
                        code: (props) => {
                          const isInline = !props.className;
                          return isInline 
                            ? <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300 text-sm font-mono" {...props} />
                            : <code className="block bg-slate-900 p-4 rounded-lg text-cyan-300 text-sm font-mono mb-4 overflow-x-auto" {...props} />;
                        },
                        table: (props) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-slate-700 rounded-lg" {...props} />
                          </div>
                        ),
                        thead: (props) => <thead className="bg-slate-900" {...props} />,
                        th: (props) => <th className="border border-slate-700 px-4 py-3 text-left text-cyan-400 font-semibold text-sm" {...props} />,
                        td: (props) => <td className="border border-slate-700 px-4 py-2 text-slate-200 text-sm" {...props} />,
                        blockquote: (props) => (
                          <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 bg-slate-900/50 italic text-slate-300" {...props} />
                        ),
                        hr: (props) => <hr className="border-slate-700 my-6" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-white leading-relaxed">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking Steps */}
        {thinkingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 max-w-[85%]">
              <div className="flex items-center gap-2 mb-3">
                <Loader className="h-4 w-4 text-cyan-400 animate-spin" />
                <span className="text-sm font-semibold text-cyan-400">AI Agent Working...</span>
              </div>
              <div className="space-y-2">
                {thinkingSteps.map((step, i) => {
                  const Icon = step.includes('calculate') ? Calculator : 
                               step.includes('search') ? Search : Database;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Icon className="h-3 w-3 text-blue-400" />
                      <span className="text-slate-300">{step}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {loading && thinkingSteps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-3">
                <Loader className="h-4 w-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to analyze your board data..."
          disabled={loading}
          className="w-full h-14 px-6 pr-14 border-2 border-slate-700 bg-slate-900 
            text-white rounded-xl focus:border-cyan-500 focus:ring-4 
            focus:ring-cyan-500/20 transition-all duration-200 outline-none
            disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 h-10 w-10 bg-gradient-to-r from-cyan-500 to-purple-600 
            text-white rounded-lg flex items-center justify-center
            hover:shadow-lg hover:shadow-blue-500/50 transition-all
            disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
