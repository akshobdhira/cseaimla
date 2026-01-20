
import React, { useMemo } from 'react';
import { GameState, GamePhase, PlayerRole, Player } from '../types';

interface HostScreenProps {
  gameState: GameState;
  onStart: () => void;
  onForceEndVote: (targetId: string) => void;
}

const HostScreen: React.FC<HostScreenProps> = ({ gameState, onStart, onForceEndVote }) => {
  const activePlayers = gameState.players.filter(p => !p.isDetained);
  const detainedPlayers = gameState.players.filter(p => p.isDetained);
  const disabledPlayers = gameState.players.filter(p => p.isDisabled && !p.isDetained);

  // Simple voting tally for the host to decide whom to detain
  // In a real app, this would be computed on the server
  const voteTallies = useMemo(() => {
    // This is a placeholder since the mock app stores "hasVoted" but not "voteForId" globally for simplicity
    // To make it functional, we'll pick the most voted player randomly or by logic if we had the data
    return [];
  }, [gameState.players]);

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-center space-y-12">
      <div className="text-center">
        <h2 className="text-2xl text-slate-400 font-bold mb-2">JOIN AT <span className="text-blue-400 underline italic">PROJECTBLACKOUT.IO</span></h2>
        <h1 className="text-9xl font-black tracking-widest text-white border-4 border-white px-8 py-4 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.2)]">
          {gameState.roomCode}
        </h1>
      </div>

      <div className="w-full max-w-5xl">
        <div className="flex flex-wrap justify-center gap-4">
          {gameState.players.map(p => (
            <div key={p.id} className="bg-slate-800 border border-slate-700 px-6 py-3 rounded-full text-xl font-bold animate-in fade-in zoom-in duration-300">
              {p.name}
            </div>
          ))}
          {gameState.players.length === 0 && (
            <p className="text-slate-500 text-2xl animate-pulse">Waiting for operators to connect...</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-12">
        {gameState.players.length >= 4 ? (
          <button onClick={onStart} className="btn-primary text-4xl px-16 py-8">INITIALIZE GAME</button>
        ) : (
          <p className="text-red-500 font-bold text-xl uppercase tracking-widest bg-red-950/30 px-6 py-3 border border-red-500 rounded-lg">
            NEED {4 - gameState.players.length} MORE PLAYERS
          </p>
        )}
      </div>
    </div>
  );

  const renderPhaseHeader = () => (
    <div className="flex justify-between items-center mb-12">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest">{gameState.phase.replace('_', ' ')}</h2>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-black">{gameState.timer}s</div>
          <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
              style={{ width: `${(gameState.timer / 120) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-slate-500 text-sm uppercase">Room Code</div>
        <div className="text-2xl font-bold">{gameState.roomCode}</div>
      </div>
    </div>
  );

  const renderGameContent = () => {
    switch (gameState.phase) {
      case GamePhase.ROLE_ASSIGNMENT:
        return (
          <div className="text-center space-y-8 mt-20">
            <h1 className="text-7xl font-black uppercase italic">Roles Transmitted</h1>
            <p className="text-3xl text-slate-400">Check your devices secretly. Do not reveal your identity.</p>
            <div className="flex justify-center gap-20 mt-12">
               <div className="text-center">
                 <div className="text-8xl">🕵️‍♂️</div>
                 <div className="text-2xl font-bold mt-4">INVESTIGATORS</div>
               </div>
               <div className="text-center opacity-50">
                 <div className="text-8xl">⚠️</div>
                 <div className="text-2xl font-bold mt-4">SABOTEURS</div>
               </div>
            </div>
          </div>
        );

      case GamePhase.ACTION:
        return (
          <div className="flex flex-col items-center justify-center space-y-12 py-20">
            <div className="relative">
               <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
               <h1 className="text-8xl font-black text-red-500 uppercase glitch relative">Blackout Protocol</h1>
            </div>
            <p className="text-3xl text-slate-300 max-w-2xl text-center">
              Network failure in progress. Saboteurs are compromising system terminals. 
              Keep your eyes up and stay vigilant.
            </p>
          </div>
        );

      case GamePhase.DISCUSSION:
        return (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 space-y-6">
              <div className="bg-blue-900/20 border-2 border-blue-500 p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-blue-500 text-white font-black uppercase italic text-xs">Decrypted Data</div>
                <h3 className="text-xl font-bold text-blue-400 mb-4 uppercase">System Intelligence Analysis:</h3>
                <p className="text-4xl font-medium leading-relaxed italic">
                  "{gameState.currentClue}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card border-red-500/50">
                  <h4 className="text-red-400 font-bold uppercase mb-4">Disabled Terminals</h4>
                  <div className="space-y-2">
                    {disabledPlayers.map(p => (
                      <div key={p.id} className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-red-500 text-xs">●</span> {p.name}
                      </div>
                    ))}
                    {disabledPlayers.length === 0 && <p className="text-slate-500 italic">None yet.</p>}
                  </div>
                </div>
                <div className="card">
                   <h4 className="text-slate-400 font-bold uppercase mb-4">Transmission History</h4>
                   <p className="text-slate-500 italic">Round active. Discussion period starts now.</p>
                </div>
              </div>
            </div>

            <div className="col-span-4 card border-slate-600">
               <h3 className="text-xl font-black uppercase mb-6 pb-2 border-b border-slate-700">Active Operators</h3>
               <div className="flex flex-wrap gap-2">
                 {activePlayers.map(p => (
                   <span key={p.id} className={`px-4 py-2 rounded-lg font-bold border ${p.isDisabled ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-slate-700 bg-slate-800'}`}>
                     {p.name}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        );

      case GamePhase.VOTE:
        return (
          <div className="flex flex-col items-center space-y-12">
             <h1 className="text-7xl font-black uppercase italic text-blue-500">Detainment Vote</h1>
             <p className="text-3xl text-slate-400">Cast your anonymous vote on your mobile device.</p>
             
             <div className="grid grid-cols-4 gap-6 w-full max-w-6xl">
               {activePlayers.map(p => (
                 <button 
                  key={p.id} 
                  onClick={() => onForceEndVote(p.id)}
                  className={`card hover:border-blue-500 transition-colors p-6 text-center group ${p.isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
                 >
                   <div className="text-sm text-slate-500 mb-1">DETAIN?</div>
                   <div className="text-2xl font-black group-hover:text-blue-400">{p.name}</div>
                   {p.hasVoted && (
                     <div className="mt-2 text-xs font-bold text-green-500 uppercase tracking-widest">SUBMITTED</div>
                   )}
                 </button>
               ))}
             </div>
          </div>
        );

      case GamePhase.REVEAL:
        const revealed = gameState.players.find(p => p.name === gameState.lastDetainedPlayer);
        return (
          <div className="flex flex-col items-center justify-center space-y-12 py-20 text-center">
             <h2 className="text-3xl text-slate-400 uppercase font-bold italic">REVEALING IDENTITY OF</h2>
             <h1 className="text-9xl font-black uppercase tracking-tighter italic text-white">{gameState.lastDetainedPlayer}</h1>
             <div className={`text-6xl font-black p-8 border-8 rounded-2xl animate-bounce ${revealed?.role === PlayerRole.SABOTEUR ? 'border-red-600 text-red-500 bg-red-950/20' : 'border-blue-600 text-blue-500 bg-blue-950/20'}`}>
               {revealed?.role === PlayerRole.SABOTEUR ? 'SABOTEUR IDENTIFIED' : 'INNOCENT INVESTIGATOR'}
             </div>
          </div>
        );

      case GamePhase.GAME_OVER:
        return (
          <div className="flex flex-col items-center justify-center space-y-12 py-20 text-center">
            <h1 className={`text-9xl font-black uppercase italic ${gameState.winner === 'INVESTIGATORS' ? 'text-blue-500' : 'text-red-500'} glitch`}>
              {gameState.winner === 'INVESTIGATORS' ? 'INVESTIGATORS WIN' : 'SABOTEURS WIN'}
            </h1>
            <p className="text-3xl text-slate-400">
              {gameState.winner === 'INVESTIGATORS' 
                ? 'The threat has been neutralized. System security restored.' 
                : 'The system has fully collapsed. Saboteurs control the network.'}
            </p>
            <div className="flex gap-4">
               <button onClick={() => window.location.reload()} className="btn-primary text-2xl">PLAY AGAIN</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-12 bg-slate-950 text-white overflow-hidden flex flex-col">
      {gameState.phase !== GamePhase.LOBBY && renderPhaseHeader()}
      <div className="flex-grow flex flex-col justify-center">
        {gameState.phase === GamePhase.LOBBY ? renderLobby() : renderGameContent()}
      </div>
      
      {/* Sidebar / Bottom Info for Active Game */}
      {gameState.phase !== GamePhase.LOBBY && gameState.phase !== GamePhase.GAME_OVER && (
        <div className="fixed bottom-0 left-0 right-0 p-8 bg-slate-900/50 backdrop-blur-md border-t border-slate-800 flex justify-between items-center">
           <div className="flex gap-8">
             <div>
               <div className="text-xs text-slate-500 uppercase font-black">Detained</div>
               <div className="flex gap-2">
                 {detainedPlayers.map(p => (
                   <span key={p.id} className="text-slate-300 font-bold line-through opacity-50">{p.name}</span>
                 ))}
                 {detainedPlayers.length === 0 && <span className="text-slate-600 italic">None</span>}
               </div>
             </div>
             <div>
               <div className="text-xs text-slate-500 uppercase font-black">Disabled</div>
               <div className="flex gap-2">
                 {disabledPlayers.map(p => (
                   <span key={p.id} className="text-red-400 font-bold">{p.name}</span>
                 ))}
                 {disabledPlayers.length === 0 && <span className="text-slate-600 italic">None</span>}
               </div>
             </div>
           </div>
           <div className="text-right">
             <div className="text-xs text-slate-500 uppercase font-black">Active Operators</div>
             <div className="text-2xl font-black">{activePlayers.length} / {gameState.players.length}</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HostScreen;
