import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, MapPin, FileText, AlertTriangle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import GovBrHeader from '../components/GovBrHeader';

const Resultado = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 57,
    seconds: 34
  });

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    } else {
      navigate('/');
    }
  }, [navigate]);

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

  const handleRegularizar = () => {
    navigate('/darf');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-govbr-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <GovBrHeader />

      {/* Banner de Alerta Crítico */}
      <div className="bg-govbr-red text-white py-4 px-4 text-center font-bold text-lg animate-fade-in">
        STATUS CRÍTICO: REGULARIZAÇÃO NECESSÁRIA
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Card Principal */}
        <Card className="mb-6 shadow-lg bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 animate-fade-in-up">
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-govbr-blue rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">
                {userData.name ? userData.name.charAt(0) : 'N'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{userData.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data de Nascimento</p>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{userData.birthDate}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Situação Cadastral</p>
                  <p className="text-lg font-bold text-govbr-red">{userData.status}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Declaração de 2023</p>
                  <p className="text-lg font-bold text-govbr-red">{userData.declaration2023}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-govbr-red mt-1" />
                <div>
                  <p className="text-sm text-govbr-red font-medium">CPF (SUSPENSO)</p>
                  <p className="text-lg font-bold text-govbr-red">{userData.cpf}</p>
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protocolo</p>
                  <p className="text-lg font-bold text-govbr-blue">{userData.protocol}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Prazo Final</p>
                  <p className="text-lg font-bold text-govbr-red">{userData.deadline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <p className="text-lg font-bold text-govbr-red">{userData.statusType}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cards de Alerta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-govbr-orange animate-fade-in-up">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-govbr-orange flex-shrink-0" />
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">Irregularidade Detectada</h3>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
                Identificamos problemas graves na sua <span className="font-bold">Declaração do Imposto de Renda 2023</span>:
              </p>
              <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-orange mt-0.5 flex-shrink-0" />
                  <span>Dados inconsistentes na declaração</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-orange mt-0.5 flex-shrink-0" />
                  <span>Atraso na entrega obrigatória</span>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                <p className="text-xs text-orange-700 dark:text-orange-400">
                  <span className="font-semibold">Base Legal:</span> Art. 7°, da Lei n° 9.430/1996
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-l-4 border-govbr-red animate-fade-in-up">
            <div className="p-6">
              <div className="flex items-start space-x-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-govbr-red flex-shrink-0" />
                <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Consequências Imediatas</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">Multa até 150%</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span>Bloqueio completo do CPF</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span>Suspensão de benefícios</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span>Restrições bancárias</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span>Bloqueio de documentos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-govbr-red mt-0.5 flex-shrink-0" />
                  <span>Inclusão no SERASA</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Timer */}
        <Card className="mb-6 shadow-lg bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-govbr-red" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tempo Restante para Regularização</h3>
            </div>
            <div className="flex justify-center space-x-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-govbr-red tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Horas</div>
              </div>
              <div className="text-5xl font-bold text-gray-300 dark:text-gray-600">:</div>
              <div className="text-center">
                <div className="text-5xl font-bold text-govbr-red tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Minutos</div>
              </div>
              <div className="text-5xl font-bold text-gray-300 dark:text-gray-600">:</div>
              <div className="text-center">
                <div className="text-5xl font-bold text-govbr-red tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Segundos</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Botão de Regularização */}
        <Button
          onClick={handleRegularizar}
          className="w-full h-16 text-xl font-bold rounded-xl shadow-lg bg-gradient-to-r from-govbr-green via-green-500 to-govbr-blue hover:from-green-700 hover:via-green-600 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-[1.02]"
        >
          <ShieldAlert className="w-6 h-6 mr-3" />
          REGULARIZAR AGORA
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Não deixe para depois. Regularize agora e evite maiores transtornos.
        </p>
      </main>
    </div>
  );
};

export default Resultado;
