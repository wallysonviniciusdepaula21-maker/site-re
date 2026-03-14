import React from 'react';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/use-theme';

const GovBrHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo e Título */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center select-none">
            <span className="text-2xl font-bold text-govbr-blue">g</span>
            <span className="text-2xl font-bold text-govbr-orange">o</span>
            <span className="text-2xl font-bold text-govbr-blue">v</span>
            <span className="text-2xl font-bold text-govbr-green">.</span>
            <span className="text-2xl font-bold text-govbr-blue">b</span>
            <span className="text-2xl font-bold text-govbr-orange">r</span>
          </div>
          <div className="hidden sm:block ml-4 border-l border-slate-200 dark:border-gray-600 pl-4">
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">Meu Imposto de Renda</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Receita Federal</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
          <button
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5 text-slate-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-slate-200 dark:border-gray-600">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">gov.br</p>
            </div>
            <div className="w-9 h-9 bg-govbr-blue rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovBrHeader;
