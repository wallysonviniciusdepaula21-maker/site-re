import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, Building, QrCode } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import GovBrHeader from '../components/GovBrHeader';

const LoadingPix = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4500),
      setTimeout(() => navigate('/pagamento-pix'), 6000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [navigate]);

  const progressSteps = [
    {
      icon: CreditCard,
      title: 'Validando Pagamento',
      subtitle: 'Verificando informações do DARF',
      color: 'text-govbr-green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      progressColor: 'bg-govbr-green',
      completed: step >= 1
    },
    {
      icon: Building,
      title: 'Conectando com Banco',
      subtitle: 'Estabelecendo conexão segura',
      color: 'text-govbr-blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      progressColor: 'bg-govbr-blue',
      completed: step >= 2
    },
    {
      icon: QrCode,
      title: 'Gerando Código PIX',
      subtitle: 'Preparando forma de pagamento',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      progressColor: 'bg-purple-500',
      completed: step >= 3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <GovBrHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Título */}
          <div className="text-center mb-8 animate-fade-in">
            <Loader2 className="w-16 h-16 text-govbr-blue animate-spin mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Carregando Informações de Pagamento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Preparando método de pagamento...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Aguarde alguns instantes</p>
          </div>

          {/* Badges */}
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { label: 'Seguro', step: 1, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
              { label: 'Criptografado', step: 2, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
              { label: 'Verificado', step: 3, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
            ].map((badge, i) => (
              <div
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  step >= badge.step ? badge.color : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                <Check className="inline w-4 h-4 mr-1" />
                {badge.label}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-govbr-green via-govbr-blue to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressSteps.map((item, index) => {
              const Icon = item.icon;
              const isActive = step === index + 1;
              const isCompleted = item.completed;

              return (
                <Card
                  key={index}
                  className={`transition-all duration-500 transform ${
                    isActive ? 'scale-105 shadow-xl' : 'scale-100 shadow-lg'
                  } ${isCompleted ? item.bgColor : 'bg-white dark:bg-gray-800'} border-slate-200 dark:border-gray-700`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted ? item.bgColor : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-10 h-10 transition-all duration-500 ${
                        isCompleted ? item.color : 'text-gray-400 dark:text-gray-500'
                      } ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-500 ${
                      isCompleted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {item.subtitle}
                    </p>
                    <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          isCompleted ? item.progressColor : 'bg-gray-300 dark:bg-gray-500'
                        }`}
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suas informações estão sendo processadas com segurança
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingPix;
