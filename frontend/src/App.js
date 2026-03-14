import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Loading from './pages/Loading';
import Resultado from './pages/Resultado';
import Darf from './pages/Darf';
import LoadingPix from './pages/LoadingPix';
import PagamentoPix from './pages/PagamentoPix';
import Chat from './pages/Chat';
import Documentos from './pages/Documentos';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/darf" element={<Darf />} />
          <Route path="/loading-pix" element={<LoadingPix />} />
          <Route path="/pagamento-pix" element={<PagamentoPix />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/documentos" element={<Documentos />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;