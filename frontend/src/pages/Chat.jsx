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
} from 'lucide-react';
import { chatService } from '../services/api';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadStats();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);

    try {
      const response = await chatService.ask(question);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: response.data.answer,
          sources: response.data.sources,
          processingTime: response.data.processing_time,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content:
            'Erro ao processar sua pergunta. Tente novamente.',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Scale className="w-6 h-6 text-blue-700" />
              <h1 className="text-xl font-bold text-slate-800">JuristaAI</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Assistente Jurídico
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/documentos')}
            >
              <FileText className="w-4 h-4 mr-1" />
              Documentos
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Stats bar */}
        {stats && (
          <div className="flex items-center space-x-4 mb-4 text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{stats.total_documents} documentos</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{stats.total_chunks} trechos indexados</span>
            </div>
          </div>
        )}

        {/* Chat area */}
        <Card className="bg-white shadow-lg border-slate-200 mb-4">
          <ScrollArea className="h-[60vh] p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Scale className="w-16 h-16 text-blue-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700 mb-2">
                  Assistente Jurídico IA
                </h2>
                <p className="text-slate-500 mb-6 max-w-md">
                  Faça perguntas sobre doutrina jurídica brasileira. O sistema
                  busca respostas fundamentadas em fontes doutrinárias
                  verificadas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-left text-sm p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-600"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.type === 'user' ? (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 max-w-[80%]">
                          <p className="text-slate-800">{msg.content}</p>
                        </div>
                      </div>
                    ) : msg.type === 'error' ? (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 max-w-[80%]">
                          <p className="text-red-700">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 max-w-[90%]">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div
                              className="text-slate-800 whitespace-pre-wrap prose prose-sm max-w-none"
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
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Fontes
                              </p>
                              {msg.sources.map((source, j) => (
                                <div
                                  key={j}
                                  className="flex items-center space-x-2 text-xs text-slate-500 bg-white rounded border border-slate-100 p-2"
                                >
                                  <BookOpen className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-medium">
                                    {source.title}
                                  </span>
                                  <span>- {source.author}</span>
                                  {source.page && (
                                    <span className="text-slate-400">
                                      p. {source.page}
                                    </span>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] ml-auto"
                                  >
                                    {Math.round(source.relevance_score * 100)}%
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Processing time */}
                          {msg.processingTime && (
                            <div className="flex items-center space-x-1 mt-2 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                Processado em {msg.processingTime}s
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          Pesquisando na base doutrinária...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input area */}
          <div className="border-t border-slate-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Faça sua pergunta jurídica..."
                className="flex-1 resize-none min-h-[44px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-700 hover:bg-blue-800 self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Info footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            JuristaAI - Assistente de pesquisa doutrinária jurídica brasileira
          </p>
          <p>
            As respostas são baseadas em fontes doutrinárias e não constituem
            aconselhamento jurídico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
