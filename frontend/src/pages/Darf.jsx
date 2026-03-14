import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, Download, Printer } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import GovBrHeader from '../components/GovBrHeader';
import { darfService } from '../services/api';

const Darf = () => {
  const navigate = useNavigate();
  const [darfData, setDarfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDarf = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
          navigate('/');
          return;
        }

        const result = await darfService.obter(userData.protocol);
        if (result.success) {
          setDarfData(result.data);
        }
      } catch (error) {
        console.error('Erro ao buscar DARF:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDarf();
  }, [navigate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleGerarDarf = () => {
    navigate('/loading-pix');
  };

  if (loading || !darfData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-govbr-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <GovBrHeader />

      {/* Banner Azul */}
      <div className="bg-govbr-blue text-white py-4 px-4 text-center font-bold text-lg flex items-center justify-center space-x-2">
        <FileText className="w-6 h-6" />
        <span>DARF - Documento de Arrecadação de Receitas Federais</span>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl bg-white dark:bg-gray-800 mb-6 border-slate-200 dark:border-gray-700 animate-fade-in-up">
          <div className="bg-gradient-to-r from-govbr-blue to-govbr-blue-dark text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">DARF</h2>
                <p className="text-blue-100 text-sm">Documento de Arrecadação de Receitas Federais</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Protocolo</p>
                <p className="text-xl font-bold">{darfData.protocolo}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nome do Contribuinte</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{darfData.contribuinte}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Período de Apuração</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{darfData.periodoApuracao}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">CPF/CNPJ</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{darfData.cpf}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-govbr-red mb-1">Data de Vencimento</p>
                <p className="text-lg font-bold text-govbr-red">{darfData.dataVencimento}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Código da Receita</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{darfData.codigoReceita}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número de Referência</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{darfData.numeroReferencia}</p>
              </div>
            </div>

            {/* Discriminação dos Valores */}
            <div className="border-t dark:border-gray-700 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-govbr-blue" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Discriminação dos Valores</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b dark:border-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">Valor Principal</span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(darfData.valorPrincipal)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b bg-red-50 dark:bg-red-900/20 px-3 rounded">
                  <span className="text-red-700 dark:text-red-300 font-medium">Multa</span>
                  <span className="text-lg font-bold text-govbr-red">{formatCurrency(darfData.multa)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b bg-red-50 dark:bg-red-900/20 px-3 rounded">
                  <span className="text-red-700 dark:text-red-300 font-medium">Juros</span>
                  <span className="text-lg font-bold text-govbr-red">{formatCurrency(darfData.juros)}</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-green-50 dark:bg-green-900/20 px-4 rounded-lg border-2 border-govbr-green">
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">VALOR A PAGAR</span>
                  <span className="text-2xl font-bold text-govbr-blue">{formatCurrency(darfData.valorTotal)}</span>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-govbr-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                    Atenção: O não pagamento até a data de vencimento resultará em:
                  </p>
                  <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                    <li>Acréscimo de multa de <span className="font-bold">20%</span> sobre o valor total</li>
                    <li>Juros de mora calculados com base na taxa SELIC</li>
                    <li>Inscrição em Dívida Ativa da União</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Código de Autenticação */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Documento gerado eletronicamente</p>
              <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">Código de Autenticação: XZn4QCWvuI</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={handleGerarDarf}
            className="w-full h-16 text-xl font-bold rounded-xl shadow-lg bg-gradient-to-r from-govbr-green via-green-500 to-govbr-blue hover:from-green-700 hover:via-green-600 hover:to-blue-700 text-white transition-all duration-300 transform hover:scale-[1.02]"
          >
            <FileText className="w-6 h-6 mr-3" />
            GERAR DARF DE PAGAMENTO
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-12 border-2 border-govbr-blue text-govbr-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold dark:border-blue-400 dark:text-blue-400"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 border-govbr-blue text-govbr-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold dark:border-blue-400 dark:text-blue-400"
            >
              <Printer className="w-5 h-5 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Mantenha este documento para seus registros. Ele pode ser usado para pagamento em qualquer agência bancária ou internet banking.
        </p>
      </main>
    </div>
  );
};

export default Darf;
