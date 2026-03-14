import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const Loading = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1500),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4500),
      setTimeout(() => navigate('/resultado'), 6000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [navigate]);

  const steps = [
    { text: 'Conectando com a base de dados', completed: step >= 1 },
    { text: 'Validando informações pessoais', completed: step >= 2 },
    { text: 'Preparando resultado', completed: step >= 3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto shadow-xl bg-white dark:bg-gray-800 rounded-2xl border-slate-200 dark:border-gray-700 animate-scale-in">
        <CardContent className="p-8">
          {/* Logo gov.br */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4 select-none">
              <span className="text-5xl font-bold text-govbr-blue">g</span>
              <span className="text-5xl font-bold text-govbr-orange">o</span>
              <span className="text-5xl font-bold text-govbr-blue">v</span>
              <span className="text-5xl font-bold text-govbr-green">.</span>
              <span className="text-5xl font-bold text-govbr-blue">b</span>
              <span className="text-5xl font-bold text-govbr-orange">r</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">CPF Brasil</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Receita Federal do Brasil</p>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-6">
            <Loader2 className="w-16 h-16 text-govbr-blue animate-spin" />
          </div>

          {/* Status Text */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Consultando seu CPF na Receita Federal
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Por favor, aguarde enquanto verificamos seus dados...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((stepItem, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  stepItem.completed
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                {stepItem.completed ? (
                  <div className="w-5 h-5 rounded-full bg-govbr-blue flex items-center justify-center flex-shrink-0 animate-scale-in">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    stepItem.completed
                      ? 'text-blue-900 dark:text-blue-200 font-medium'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {stepItem.text}
                </span>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ShieldCheck className="w-5 h-5 text-govbr-blue mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900 dark:text-blue-200">
                Seus dados estão sendo processados de forma segura e confidencial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
