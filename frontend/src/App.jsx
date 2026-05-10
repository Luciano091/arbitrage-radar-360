import React, { useState, useEffect, useMemo } from 'react'
import { Zap, TrendingUp, ChevronDown, List, Target, Wallet, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')
  const [history, setHistory] = useState([])
  const [data, setData] = useState({ binance: 0, kraken: 0, spread: 0, percent: 0, ranking: [] })

  const COLORS = ['#22d3ee', '#a855f7', '#1e293b'];

  // --- LÓGICA DE DADOS ---
  const getMainDisplayData = () => {
    if (selectedSymbol === 'BTC/USDT') return data;
    const found = data.ranking?.find(item => item.symbol === selectedSymbol);
    return found || { ...data, binance: 0, kraken: 0, spread: 0, percent: 0 }; 
  }

  const current = getMainDisplayData();

  // --- GRÁFICO DE PIZZA DINÂMICO ---
  const dynamicPieData = useMemo(() => [
    { name: 'Binance Flow', value: 50 + (current.percent * 10) },
    { name: 'Kraken Flow', value: 30 + (current.percent * 5) },
    { name: 'Market Gap', value: 20 - (current.percent * 15) }
  ], [current.percent]);

  // 1. Fetch Real-time (Redis)
  useEffect(() => {
    const fetchDados = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/opportunity');
        const result = await response.json();
        if (result && result.binance) setData(result);
      } catch (e) { console.log("Aguardando API..."); }
    };
    const interval = setInterval(fetchDados, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Histórico (Postgres)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const sym = selectedSymbol.replace('/', '-');
        const response = await fetch(`http://localhost:8000/api/history/${sym}`);
        const result = await response.json();
        if (Array.isArray(result)) setHistory(result);
      } catch (e) { }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 font-sans antialiased selection:bg-cyan-900">
      
      {/* HEADER */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 p-2 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Arbitrage <span className="text-cyan-500">Radar 360</span></h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest text-nowrap">Sistema Online</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <select 
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 px-6 py-2 rounded-xl text-sm font-black text-white outline-none focus:border-cyan-500 cursor-pointer transition-all pr-12 shadow-xl"
            >
              <option value="BTC/USDT">BTC/USDT</option>
              <option value="ETH/USDT">ETH/USDT</option>
              <option value="SOL/USDT">SOL/USDT</option>
              <option value="ADA/USDT">ADA/USDT</option>
              <option value="XRP/USDT">XRP/USDT</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 pointer-events-none" />
          </div>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA (MANTIDA) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 bg-[#F3BA2F] rounded-full flex items-center justify-center font-bold text-[8px] text-black">B</div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Binance Ask</h3>
            </div>
            <p className="text-3xl font-black text-cyan-400 font-mono tracking-tighter">
              ${current?.binance?.toLocaleString('en-US', {minimumFractionDigits: 2}) || "0.00"}
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 bg-[#584EFA] rounded-full flex items-center justify-center font-bold text-[8px] text-white">K</div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kraken Bid</h3>
            </div>
            <p className="text-3xl font-black text-purple-400 font-mono tracking-tighter">
              ${current?.kraken?.toLocaleString('en-US', {minimumFractionDigits: 2}) || "0.00"}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] shadow-2xl text-center flex-1 flex flex-col justify-center">
            <h3 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Spread Atual</h3>
            <p className="text-5xl font-black text-white font-mono tracking-tighter">
              ${current.spread < 1 ? current.spread.toFixed(4) : current.spread.toFixed(2)}
            </p>
            <p className="text-lg font-bold text-green-500 mt-1">+{current.percent.toFixed(3)}%</p>
          </div>

          <div className="bg-slate-900/30 p-4 rounded-3xl border border-slate-800/50 shadow-inner h-[340px] flex flex-col">
             <div className="flex items-center justify-between mb-4 px-2">
                <List className="w-4 h-4 text-cyan-500" />
                <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Logs Postgres</h3>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                {history.slice(-10).reverse().map((h, i) => (
                  <div key={i} className="flex justify-between text-[10px] font-mono border-b border-slate-800/30 py-2">
                    <span className="text-slate-600">{h.time}</span>
                    <span className="text-green-400 font-bold">${h.spread.toFixed(4)}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* COLUNA CENTRAL (REFORMULADA PARA O VISUAL PRO) */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-white text-lg tracking-tight uppercase">Oportunidades Atuais</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top 3 melhores oportunidades</p>
              </div>
              <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">24h Sparkline</span>
            </div>
            
            <div className="space-y-4">
              {data.ranking?.slice(0, 3).map((item, index) => (
                <div 
                  key={item.symbol} 
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-300 cursor-pointer group ${
                    item.symbol === selectedSymbol ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-slate-800/10 border-slate-800/50 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="bg-[#1e293b] w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-yellow-500 border border-slate-700 shadow-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-black text-xl tracking-tighter">
                        ${item.spread < 1 ? item.spread.toFixed(4) : item.spread.toFixed(2)}
                      </span>
                      <span className="text-green-500 text-xs font-black">+{item.percent.toFixed(3)}%</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">
                      Spread = v${item.spread.toFixed(2)} / v${item.kraken.toFixed(1)} / v${item.binance.toFixed(1)} + ci 05:32
                    </p>
                  </div>
                  {/* MINI-GRÁFICO (Sparkline) */}
                  <div className="w-24 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.slice(-15)}>
                        <Line 
                          type="monotone" 
                          dataKey="spread" 
                          stroke={index === 0 ? '#22d3ee' : '#a855f7'} 
                          strokeWidth={2} 
                          dot={false} 
                          isAnimationActive={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <button className="hidden xl:flex items-center gap-2 text-[9px] font-black bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-slate-200 hover:bg-cyan-600 hover:text-black hover:border-cyan-500 transition-all uppercase whitespace-nowrap">
                    Comprar Binance / Vender Kraken
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GRÁFICO DE MERCADO 24H (REFORMULADO) */}
          <div className="bg-[#0f172a]/50 border border-slate-800 p-6 rounded-[2.5rem] h-[340px] shadow-2xl flex flex-col backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">{selectedSymbol} de mercado (24h)</h3>
              <div className="flex gap-4 text-[10px] font-bold text-slate-600">
                <span>$15.80</span><span>$13.70</span><span>$13.74</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorSpreadCentral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '15px' }} />
                  <Area type="monotone" dataKey="spread" stroke="#22d3ee" fillOpacity={1} fill="url(#colorSpreadCentral)" strokeWidth={4} isAnimationActive={true} animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (MANTIDA) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-slate-950 to-black border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl group border-t-cyan-500/30 active:scale-95 transition-all">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tighter flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" /> Executar
            </h2>
            <button className="w-full py-4 bg-transparent border-2 border-cyan-500/50 text-white font-black rounded-2xl shadow-[0_0_25px_rgba(34,211,238,0.1)] hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-widest text-xs">
              Ordem Direta
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-md flex-1 flex flex-col">
            <h3 className="text-white font-black mb-6 text-sm uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" /> Performance
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-44 w-44 relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dynamicPieData} innerRadius={62} outerRadius={82} paddingAngle={8} dataKey="value" stroke="none" isAnimationActive={true} animationDuration={1500}>
                      {dynamicPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Dentro do PieChart, no centro do gráfico */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Spread Atual</span>
                  <span className="text-2xl font-black text-green-500">
                    {/* Isso aqui puxa o valor real do spread da API */}
                    +{current.percent.toFixed(3)}% 
                  </span>
                </div>
              </div>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center bg-slate-800/20 p-4 rounded-2xl border border-slate-800/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume Est.</span>
                  <span className="text-white font-mono font-black text-sm">${((current.binance || 0) * 0.047).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/20 p-4 rounded-2xl border border-slate-800/50">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amostras (DB)</span>
                  <span className="text-white font-mono font-black text-lg">{history.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-[9px] font-black uppercase tracking-[0.4em] flex justify-between items-center text-slate-700 pt-4 border-t border-slate-800/30">
        <p>Arbitrage Radar v5.6.0-Premium</p>
        <div className="flex gap-6"><span>Ping: 2ms</span><span>PostgreSQL: Ativo</span></div>
      </footer>
    </div>
  )
}

export default App