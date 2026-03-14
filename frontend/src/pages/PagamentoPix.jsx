import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Copy, FileText, Check, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import GovBrHeader from '../components/GovBrHeader';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';
import { pixService } from '../services/api';

const PagamentoPix = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 29,
    seconds: 45
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generatePix = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          navigate('/');
          return;
        }

        const result = await pixService.gerar(userData.protocol, 149.42, userData.cpf);
        if (result.success) {
          setPaymentData({
            name: userData.name,
            cpf: userData.cpf,
            protocol: userData.protocol,
            value: 149.42,
            dueDate: userData.deadline,
            status: result.data.status,
            pixCode: result.data.pixCode,
            qrCodeUrl: result.data.qrCodeUrl
          });
        }
      } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        toast({
          title: "Erro",
          description: "Erro ao gerar PIX. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    generatePix();
  }, [navigate, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!paymentData) return;

    const checkPayment = async () => {
      try {
        const result = await pixService.verificar(paymentData.protocol);
        if (result.success && result.data.status === 'PAGO') {
          toast({
            title: "Pagamento Confirmado!",
            description: "Seu pagamento foi processado com sucesso.",
          });
          setPaymentData(prev => ({ ...prev, status: 'PAGO' }));
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    };

    const interval = setInterval(checkPayment, 30000);
    return () => clearInterval(interval);
  }, [paymentData, toast]);

  const handleCopyPix = () => {
    if (!paymentData) return;

    navigator.clipboard.writeText(paymentData.pixCode).then(() => {
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no aplicativo do seu banco para pagar.",
      });
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente manualmente.",
        variant: "destructive"
      });
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-govbr-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <GovBrHeader />

      {/* Banner com Timer */}
      <div className="bg-govbr-red text-white py-4 px-4 text-center font-bold text-lg flex items-center justify-center space-x-2">
        <Clock className="w-6 h-6" />
        <span className="tabular-nums">
          Tempo restante para pagamento: {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Info Card */}
        <Card className="mb-6 shadow-lg bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 animate-fade-in-up">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nome:</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{paymentData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF:</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{paymentData.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protocolo:</p>
                <p className="font-semibold text-govbr-blue">{paymentData.protocol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor:</p>
                <p className="text-2xl font-bold text-govbr-green">{formatCurrency(paymentData.value)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vencimento:</p>
                <p className="font-bold text-govbr-red">{paymentData.dueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status:</p>
                <p className="font-bold text-govbr-orange">{paymentData.status}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* PIX Card */}
        <Card className="mb-6 shadow-xl bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 animate-fade-in-up">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
              Pagamento via PIX
            </h2>

            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Escaneie o QR Code ou copie o código PIX abaixo
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg border-4 border-govbr-blue shadow-lg">
                <img
                  src={paymentData.qrCodeUrl}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            </div>

            {/* Código PIX */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código PIX:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={paymentData.pixCode}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-hidden"
                />
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-govbr-yellow mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">Como pagar:</p>
                  <ol className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                    <li>1. Abra o aplicativo do seu banco</li>
                    <li>2. Acesse a área PIX</li>
                    <li>3. Escaneie o QR Code ou cole o código PIX</li>
                    <li>4. Confirme o valor de {formatCurrency(paymentData.value)}</li>
                    <li>5. Conclua o pagamento</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-12 border-2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                <FileText className="w-5 h-5 mr-2" />
                Gerar DARF
              </Button>
              <Button
                variant="outline"
                className="h-12 border-2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                <Check className="w-5 h-5 mr-2" />
                Verificar
              </Button>
              <Button
                onClick={handleCopyPix}
                className={`h-12 font-semibold transition-all duration-300 ${
                  copied
                    ? 'bg-govbr-green hover:bg-green-700'
                    : 'bg-govbr-blue hover:bg-govbr-blue-dark'
                } text-white`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar PIX
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Verificação automática a cada 30 segundos
        </p>
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-1">
          Última verificação: {new Date().toLocaleTimeString('pt-BR')}
        </p>
      </main>
      <Toaster />
    </div>
  );
};

export default PagamentoPix;
