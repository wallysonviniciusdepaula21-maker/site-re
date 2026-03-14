import React from 'react';
import GovBrHeader from '../components/GovBrHeader';
import LoginCard from '../components/LoginCard';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <GovBrHeader />

      <main className="container mx-auto px-4 py-16">
        <LoginCard />
      </main>
    </div>
  );
};

export default Home;
