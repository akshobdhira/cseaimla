
import React, { useState } from 'react';
import { Player, GameState, GamePhase, PlayerRole } from '../types';

interface PlayerScreenProps {
  player: Player;
  gameState: GameState;
  onAction: (targetId: string) => void;
  onVote: (targetId: string) => void;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ player, gameState, onAction, onVote }) => {
  const [votedFor, setVotedFor] = useState<string | null>(null);

  const isSaboteur = player.role === PlayerRole.SABOTEUR;
  const isDisabled = player.isDisabled;
  const isDetained = player.isDetained;

  const handleVote = (targetId: string) => {
    setVotedFor(targetId);
    onVote(targetId);
  };

  if (isDetained) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-4xl font-black text-red-600 uppercase mb-4">You are Detained</h1>
        <p className="text-slate-400">You have been removed from the network. Keep quiet and watch the fallout.</p>
      </div>
    );
  }

  const renderStatus = () => (
    <div className="w-full p-4 mb-4 flex justify-between items-center bg-slate-900 border-b border-slate-700">
       <div className="font-bold">{player.name}</div>
       <div className={`text-xs px-3 py-1 rounded-full font-black uppercase ${isDisabled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
         {isDisabled ? 'TERMINAL DISABLED' : 'SYSTEM ONLINE'}
       </div>
    </div>
  );

  const renderPhaseContent = () => {
    switch (gameState.phase) {
      case GamePhase.LOBBY:
        return (
          <div className="flex flex-col items-center justify-center flex-grow p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.5)]">
               <span className="text-4xl">📡</span>
            </div>
            <h2 className="text-2xl font-black">CONNECTED</h2>
            <p className="text-slate-400">Wait for the Host to initialize the network. Keep this screen active.</p>
            <div className="text-sm text-slate-500">Room: {gameState.roomCode}</div>
          </div>
        );

      case GamePhase.ROLE_ASSIGNMENT:
        return (
          <div className={`flex flex-col items-center justify-center flex-grow p-8 text-center space-y-8 animate-in slide-in-from-bottom duration-500 ${isSaboteur ? 'bg-red-950/20' : 'bg-blue-950/20'}`}>
            <h3 className="text-slate-400 font-bold uppercase tracking-widest">Your Private Role</h3>
            <div className={`text-5xl font-black uppercase italic ${isSaboteur ? 'text-red-500 glitch' : 'text-blue-400'}`}>
              {player.role}
            </div>
            {isSaboteur && (
              <div className="card border-red-500 bg-red-950/40 p-6 space-y-2">
                 <div className="text-xs text-red-400 font-bold uppercase">Your Partner</div>
                 <div className="text-2xl font-black">{player.partnerName || 'Unknown'}</div>
                 <p className="text-xs text-slate-400">Work together to disable investigators secretly.</p>
              </div>
            )}
            {!isSaboteur && (
              <p className="text-slate-400 text-lg">Identify and detain the Saboteurs before the system crashes.</p>
            )}
            <div className="pt-8 text-xs text-slate-600 uppercase font-black italic">Hiding in 3, 2, 1...</div>
          </div>
        );

      case GamePhase.ACTION:
        if (isSaboteur && !isDisabled) {
          return (
            <div className="flex flex-col p-6 space-y-6 animate-in fade-in duration-500">
               <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black text-red-500 uppercase">Sabotage</h2>
                 <p className="text-slate-400">Select an Investigator terminal to disable for this round.</p>
               </div>
               <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[60vh]">
                 {gameState.players
                    .filter(p => p.role !== PlayerRole.SABOTEUR && !p.isDisabled && !p.isDetained)
                    .map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => onAction(p.id)}
                        className="bg-slate-800 border-2 border-slate-700 hover:border-red-500 p-4 rounded-xl text-xl font-bold transition-all active:scale-95 text-left flex justify-between items-center"
                      >
                        {p.name}
                        <span className="text-red-500 text-xs">OFFLINE ▶</span>
                      </button>
                    ))}
               </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center justify-center flex-grow p-8 text-center space-y-6">
            <div className="text-6xl animate-pulse">⚠️</div>
            <h2 className="text-3xl font-black uppercase italic">Blackout</h2>
            <p className="text-slate-400">Someone is compromising the network. Look around you. Who is acting suspicious?</p>
          </div>
        );

      case GamePhase.DISCUSSION:
        return (
          <div className="flex flex-col flex-grow p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-blue-500 uppercase">Discussion</h2>
              <div className="text-4xl font-black tabular-nums">{gameState.timer}s</div>
            </div>
            
            <div className="card bg-blue-900/10 border-blue-500/30 p-4">
               <h4 className="text-xs text-blue-400 font-black uppercase mb-2">Decrypted Clue</h4>
               <p className="italic font-medium text-slate-200">"{gameState.currentClue}"</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase">Operational Rules</h3>
              <ul className="text-sm space-y-2 text-slate-400 list-disc pl-4">
                <li>Discuss clues with everyone.</li>
                <li>Disabled players can still speak but cannot vote later.</li>
                <li>Saboteurs will try to deflect blame.</li>
              </ul>
            </div>

            {isDisabled && (
              <div className="mt-auto bg-red-900/30 border border-red-600 p-4 rounded-lg text-red-400 font-bold text-center">
                 YOUR TERMINAL IS DISABLED. <br/> YOU CANNOT VOTE THIS ROUND.
              </div>
            )}
          </div>
        );

      case GamePhase.VOTE:
        if (isDisabled) {
          return (
            <div className="flex flex-col items-center justify-center flex-grow p-8 text-center bg-red-950/20">
               <div className="text-6xl mb-4">📵</div>
               <h2 className="text-2xl font-black text-red-500 uppercase">ACCESS DENIED</h2>
               <p className="text-slate-400">Your terminal has been disabled by the Saboteurs. You cannot participate in the vote.</p>
            </div>
          );
        }
        
        if (votedFor) {
           const target = gameState.players.find(p => p.id === votedFor);
           return (
             <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
               <div className="text-6xl mb-4">✅</div>
               <h2 className="text-2xl font-black text-green-500 uppercase">VOTE CAST</h2>
               <p className="text-slate-400">You voted to detain <span className="text-white font-bold">{target?.name}</span>.</p>
               <p className="text-xs text-slate-500 mt-4">Waiting for remaining operators...</p>
             </div>
           );
        }

        return (
          <div className="flex flex-col p-6 space-y-4 animate-in fade-in">
             <div className="text-center">
               <h2 className="text-3xl font-black text-blue-500 uppercase">VOTE</h2>
               <p className="text-slate-400">Who is the Saboteur?</p>
             </div>
             <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[70vh] pb-8">
               {gameState.players
                .filter(p => !p.isDetained && p.id !== player.id)
                .map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => handleVote(p.id)}
                    className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-lg font-bold hover:bg-slate-700 active:bg-blue-900 transition-colors text-left"
                  >
                    {p.name}
                  </button>
                ))}
             </div>
          </div>
        );

      case GamePhase.REVEAL:
        return (
          <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
             <div className="text-6xl animate-pulse mb-6">📂</div>
             <h2 className="text-2xl font-black uppercase">Filing Report...</h2>
             <p className="text-slate-400">Look at the Host Screen for the identity reveal.</p>
          </div>
        );

      case GamePhase.GAME_OVER:
        return (
          <div className={`flex flex-col items-center justify-center flex-grow p-8 text-center ${gameState.winner === 'INVESTIGATORS' ? 'bg-blue-950/20' : 'bg-red-950/20'}`}>
             <h2 className={`text-4xl font-black uppercase mb-4 italic ${gameState.winner === 'INVESTIGATORS' ? 'text-blue-500' : 'text-red-500'}`}>
               {gameState.winner === 'INVESTIGATORS' ? 'Victory' : 'Defeat'}
             </h2>
             <p className="text-slate-300">System shutdown complete. Review results on the host screen.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {renderStatus()}
      {renderPhaseContent()}
      
      {/* Role Reminder Mini-Tab */}
      {gameState.phase !== GamePhase.LOBBY && gameState.phase !== GamePhase.GAME_OVER && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 flex justify-center">
           <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSaboteur ? 'text-red-500' : 'text-blue-400'}`}>
             CURRENT ASSIGNMENT: {player.role}
             {isSaboteur && ` • PARTNER: ${player.partnerName}`}
           </div>
        </div>
      )}
    </div>
  );
};

export default PlayerScreen;
