import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Scale,
  BookOpen,
  MessageSquare,
  Plus,
  Database,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { documentService } from '../services/api';
import { useTheme } from '../hooks/use-theme';

const STATUS_CONFIG = {
  indexed: { label: 'Indexado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  indexing: { label: 'Indexando', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Loader2 },
  pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: Clock },
  error: { label: 'Erro', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
};

const Documentos = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    legal_subject: '',
    file: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsRes, subjectsRes, statsRes] = await Promise.all([
        documentService.list(),
        documentService.getSubjects(),
        documentService.getStats(),
      ]);
      setDocuments(docsRes.data);
      setSubjects(subjectsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      if (formData.year) data.append('year', formData.year);
      data.append('legal_subject', formData.legal_subject);
      if (formData.file) data.append('file', formData.file);

      await documentService.upload(data);
      setFormData({ title: '', author: '', year: '', legal_subject: '', file: null });
      setDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await documentService.delete(docId);
      await loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="text-slate-600 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-govbr-blue" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-gray-100">JuristaAI</h1>
            </div>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Acervo Jurídico
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
              onClick={() => navigate('/chat')}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: BookOpen, value: stats.total_documents, label: 'Documentos', color: 'text-govbr-blue' },
              { icon: Database, value: stats.total_chunks, label: 'Trechos', color: 'text-govbr-green' },
              { icon: CheckCircle, value: stats.indexed_documents, label: 'Indexados', color: 'text-emerald-600 dark:text-emerald-400' },
              { icon: Clock, value: stats.pending_documents, label: 'Pendentes', color: 'text-amber-600 dark:text-amber-400' },
            ].map((stat, i) => (
              <Card key={i} className="p-4 bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-gray-200">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Document list */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-slate-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-gray-200">
              Documentos do Acervo
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-govbr-blue hover:bg-govbr-blue-dark">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-200">Adicionar Documento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-gray-300">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título da obra"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author" className="dark:text-gray-300">Autor</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Nome do autor"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year" className="dark:text-gray-300">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="2024"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="dark:text-gray-300">Área do Direito</Label>
                      <Select
                        value={formData.legal_subject}
                        onValueChange={(value) => setFormData({ ...formData, legal_subject: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="file" className="dark:text-gray-300">Arquivo (PDF)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.epub"
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-govbr-blue hover:bg-govbr-blue-dark"
                    disabled={isUploading || !formData.title.trim()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Documento
                      </>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-gray-400 mb-2">Nenhum documento no acervo</p>
                <p className="text-sm text-slate-400 dark:text-gray-500">
                  Adicione documentos jurídicos para enriquecer a base de conhecimento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-slate-100 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-govbr-blue" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-800 dark:text-gray-200 truncate">{doc.title}</p>
                          <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-gray-400">
                            {doc.author && <span>{doc.author}</span>}
                            {doc.year && <span>{doc.year}</span>}
                            {doc.legal_subject && (
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                {doc.legal_subject}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right text-xs text-slate-400 dark:text-gray-500">
                          <p>{doc.total_chunks} trechos</p>
                          <p>{formatFileSize(doc.file_size)}</p>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          aria-label={`Excluir ${doc.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400 dark:text-gray-500 mt-6 space-y-1">
          <p>JuristaAI - Gestão de acervo doutrinário jurídico</p>
          <p>Documentos são processados e indexados automaticamente para consulta via chat.</p>
        </div>
      </div>
    </div>
  );
};

export default Documentos;
