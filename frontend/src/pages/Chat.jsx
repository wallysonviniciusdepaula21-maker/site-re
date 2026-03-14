import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  Send,
  Bot,
  User,
  BookOpen,
  Clock,
  ArrowLeft,
  Scale,
  Loader2,
  FileText,
  Info,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { chatService } from '../services/api';
import { useTheme } from '../hooks/use-theme';

const Chat = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStats = async () => {
    try {
      const response = await chatService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await chatService.listConversations();
      setConversations(response.data || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const handleNewConversation = async () => {
    setMessages([]);
    setActiveConversationId(null);
  };

  const handleSelectConversation = async (convId) => {
    try {
      const response = await chatService.getConversation(convId);
      const conv = response.data;
      setActiveConversationId(convId);
      const loadedMessages = [];
      for (const msg of conv.messages || []) {
        loadedMessages.push({ type: 'user', content: msg.question });
        loadedMessages.push({
          type: 'assistant',
          content: msg.answer,
          sources: msg.sources,
          processingTime: msg.processing_time,
        });
      }
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await chatService.deleteConversation(convId);
      if (activeConversationId === convId) {
        setMessages([]);
        setActiveConversationId(null);
      }
      await loadConversations();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleStartEditTitle = (e, conv) => {
    e.stopPropagation();
    setEditingTitle(conv.id);
    setEditTitleValue(conv.title);
  };

  const handleSaveTitle = async (e, convId) => {
    e.stopPropagation();
    if (!editTitleValue.trim()) return;
    try {
      await chatService.updateTitle(convId, editTitleValue.trim());
      setEditingTitle(null);
      await loadConversations();
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleCancelEditTitle = (e) => {
    e.stopPropagation();
    setEditingTitle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);

    try {
      let convId = activeConversationId;

      // Create conversation on first message
      if (!convId) {
        const convResponse = await chatService.createConversation(question.slice(0, 60));
        convId = convResponse.data.id;
        setActiveConversationId(convId);
      }

      const response = await chatService.ask(question, 5, convId);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
          processingTime: response.data.processing_time,
        },
      ]);
      await loadConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: 'Erro ao processar sua pergunta. Tente novamente.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    'O que é responsabilidade civil objetiva?',
    'O que é habeas corpus?',
    'Quais são os princípios do direito contratual?',
    'Quais os direitos básicos do consumidor?',
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 dark:text-gray-400"
              aria-label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-govbr-blue" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100">JuristaAI</h1>
            </div>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Assistente Jurídico
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/documentos')}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <FileText className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Documentos</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Conversations */}
        {sidebarOpen && (
          <aside className="w-72 border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col animate-slide-in-right">
            <div className="p-3 border-b border-slate-100 dark:border-gray-700">
              <Button
                onClick={handleNewConversation}
                className="w-full bg-govbr-blue hover:bg-govbr-blue-dark text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conversa
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-gray-500">Nenhuma conversa</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        activeConversationId === conv.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        {editingTitle === conv.id ? (
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              className="text-sm w-full bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-slate-800 dark:text-gray-200"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(e, conv.id);
                                if (e.key === 'Escape') handleCancelEditTitle(e);
                              }}
                            />
                            <button onClick={(e) => handleSaveTitle(e, conv.id)} className="text-green-600 hover:text-green-700">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={handleCancelEditTitle} className="text-red-500 hover:text-red-600">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate">
                              {conv.title}
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-xs text-slate-400 dark:text-gray-500">
                                {conv.message_count} msg
                              </span>
                              <span className="text-xs text-slate-400 dark:text-gray-500">
                                {formatDate(conv.updated_at)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      {editingTitle !== conv.id && (
                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartEditTitle(e, conv)}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
                            aria-label="Renomear conversa"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600"
                            aria-label="Excluir conversa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Stats bar */}
          {stats && (
            <div className="flex items-center space-x-4 px-6 py-2 text-sm text-slate-500 dark:text-gray-400 border-b border-slate-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{stats.total_documents} documentos</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5" />
                <span>{stats.total_chunks} trechos indexados</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 md:px-6 py-4">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center mb-4">
                    <Scale className="w-8 h-8 text-govbr-blue" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-200 mb-2 font-serif">
                    Assistente Jurídico IA
                  </h2>
                  <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-md">
                    Faça perguntas sobre doutrina jurídica brasileira. O sistema
                    busca respostas fundamentadas em fontes doutrinárias verificadas.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="text-left text-sm p-3 rounded-lg border border-slate-200 dark:border-gray-600 hover:border-govbr-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 text-slate-600 dark:text-gray-300 hover:shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div key={i} className="animate-fade-in-up">
                      {msg.type === 'user' ? (
                        <div className="flex items-start space-x-3 justify-end">
                          <div className="bg-govbr-blue text-white rounded-2xl rounded-tr-sm p-4 max-w-[80%] shadow-sm">
                            <p>{msg.content}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-govbr-blue flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : msg.type === 'error' ? (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <Info className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl rounded-tl-sm p-4 max-w-[80%]">
                            <p className="text-red-700 dark:text-red-300">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 max-w-[90%]">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 dark:border-gray-700">
                              <div
                                className="text-slate-800 dark:text-gray-200 whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: msg.content
                                    .replace(
                                      /\*\*(.*?)\*\*/g,
                                      '<strong>$1</strong>'
                                    )
                                    .replace(/\n/g, '<br />'),
                                }}
                              />
                            </div>

                            {/* Sources */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                  Fontes
                                </p>
                                {msg.sources.map((source, j) => (
                                  <div
                                    key={j}
                                    className="flex items-center space-x-2 text-xs text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-100 dark:border-gray-700 p-2"
                                  >
                                    <BookOpen className="w-3 h-3 flex-shrink-0 text-govbr-blue" />
                                    <span className="font-medium">{source.title}</span>
                                    <span className="text-slate-400">- {source.author}</span>
                                    {source.page && (
                                      <span className="text-slate-400">p. {source.page}</span>
                                    )}
                                    <Badge variant="outline" className="text-[10px] ml-auto">
                                      {Math.round(source.relevance_score * 100)}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Processing time */}
                            {msg.processingTime && (
                              <div className="flex items-center space-x-1 mt-2 text-xs text-slate-400 dark:text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Processado em {msg.processingTime}s</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2 text-slate-500 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Pesquisando na base doutrinária...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex space-x-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Faça sua pergunta jurídica..."
                className="flex-1 resize-none min-h-[44px] max-h-[120px] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-govbr-blue hover:bg-govbr-blue-dark self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="max-w-3xl mx-auto text-center text-xs text-slate-400 dark:text-gray-500 mt-2">
              As respostas são baseadas em fontes doutrinárias e não constituem aconselhamento jurídico.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
