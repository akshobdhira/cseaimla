
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GamePhase, GameState, Player, PlayerRole, VoteData } from './types';
import HostScreen from './components/HostScreen';
import PlayerScreen from './components/PlayerScreen';
import { generateRoomCode, assignRoles, generateClue } from './utils';

/**
 * Since this is a browser-based demo, we use a single state to represent
 * the "Server" truth. In a real environment, this would be handled by 
 * Socket.IO and a Node.js backend.
 */

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'HOST' | 'PLAYER'>('HOME');
  const [gameState, setGameState] = useState<GameState>({
    roomCode: '',
    phase: GamePhase.LOBBY,
    players: [],
    timer: 0,
  });
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);

  // --- "SERVER" ACTIONS (Only called by Host logic) ---
  
  const createRoom = () => {
    const code = generateRoomCode();
    setGameState(prev => ({ ...prev, roomCode: code, phase: GamePhase.LOBBY, players: [] }));
    setView('HOST');
  };

  const joinRoom = (code: string, name: string) => {
    if (code !== gameState.roomCode) return alert("Invalid Room Code");
    const id = Math.random().toString(36).substr(2, 9);
    const newPlayer: Player = {
      id,
      name,
      role: PlayerRole.PENDING,
      isDisabled: false,
      isDetained: false,
      hasVoted: false,
    };
    setGameState(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
    setLocalPlayerId(id);
    setView('PLAYER');
  };

  const startRoleAssignment = () => {
    const playersWithRoles = assignRoles(gameState.players);
    setGameState(prev => ({ ...prev, players: playersWithRoles, phase: GamePhase.ROLE_ASSIGNMENT, timer: 10 }));
  };

  const startActionPhase = () => {
    setGameState(prev => ({ ...prev, phase: GamePhase.ACTION, timer: 30 }));
  };

  const saboteurAction = (targetId: string) => {
    const target = gameState.players.find(p => p.id === targetId);
    if (!target) return;
    
    setGameState(prev => ({
      ...prev,
      lastDisabledPlayer: target.name,
      players: prev.players.map(p => p.id === targetId ? { ...p, isDisabled: true } : p),
      phase: GamePhase.DISCUSSION,
      currentClue: generateClue(prev, targetId),
      timer: 120
    }));
  };

  const castVote = (voterId: string, targetId: string) => {
    // Record vote locally (in a real app, the server would tally this)
    setGameState(prev => {
      const updatedPlayers = prev.players.map(p => p.id === voterId ? { ...p, hasVoted: true } : p);
      // We check if everyone has voted
      const activeVoters = updatedPlayers.filter(p => !p.isDisabled && !p.isDetained);
      const votesReceived = updatedPlayers.filter(p => p.hasVoted && !p.isDetained).length;
      
      const newState = { ...prev, players: updatedPlayers };
      
      // If we are at the end of voting
      if (votesReceived >= activeVoters.length) {
        // Tally votes (using temporary logic for this demo)
        // Usually, votes would be an array in state
      }
      return newState;
    });
  };

  const finalizeVotes = (targetId: string) => {
    const target = gameState.players.find(p => p.id === targetId);
    if (!target) return;

    setGameState(prev => {
      const updatedPlayers = prev.players.map(p => p.id === targetId ? { ...p, isDetained: true } : p);
      
      // Win check
      const remainingSaboteurs = updatedPlayers.filter(p => p.role === PlayerRole.SABOTEUR && !p.isDetained).length;
      const activeInvestigators = updatedPlayers.filter(p => p.role === PlayerRole.INVESTIGATOR && !p.isDisabled && !p.isDetained).length;

      let winner: 'SABOTEURS' | 'INVESTIGATORS' | undefined;
      if (remainingSaboteurs === 0) winner = 'INVESTIGATORS';
      else if (activeInvestigators === 0) winner = 'SABOTEURS';

      return {
        ...prev,
        players: updatedPlayers.map(p => ({ ...p, hasVoted: false })), // Reset votes
        lastDetainedPlayer: target.name,
        phase: winner ? GamePhase.GAME_OVER : GamePhase.REVEAL,
        timer: 10,
        winner
      };
    });
  };

  const nextRound = () => {
    startActionPhase();
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    // Fix: Using ReturnType<typeof setInterval> instead of NodeJS.Timeout to resolve namespace issues in browser environment
    let interval: ReturnType<typeof setInterval> | undefined;
    if (gameState.timer > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: Math.max(0, prev.timer - 1) }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.timer]);

  // Auto-advance phases if timer hits 0
  useEffect(() => {
    if (gameState.timer === 0 && view === 'HOST') {
      if (gameState.phase === GamePhase.ROLE_ASSIGNMENT) startActionPhase();
      if (gameState.phase === GamePhase.REVEAL) startActionPhase();
      if (gameState.phase === GamePhase.DISCUSSION) {
        setGameState(prev => ({ ...prev, phase: GamePhase.VOTE, timer: 30 }));
      }
    }
  }, [gameState.timer, gameState.phase, view]);

  // --- RENDERING ---

  if (view === 'HOME') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic glitch">Project Blackout</h1>
          <p className="text-slate-400 font-medium">COVERT CLASSROOM STRATEGY</p>
        </div>
        
        <div className="flex flex-col w-full max-w-sm gap-4">
          <div className="card p-8 space-y-6">
            <button onClick={createRoom} className="btn-primary w-full py-6 text-xl">CREATE ROOM (HOST)</button>
            <div className="border-t border-slate-700 pt-6">
              <p className="text-sm text-slate-500 mb-4">JOIN AN EXISTING GAME</p>
              <div className="space-y-3">
                <input 
                  type="text" 
                  id="join-code"
                  placeholder="ROOM CODE" 
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-lg text-center font-bold tracking-widest text-2xl uppercase"
                />
                <input 
                  type="text" 
                  id="join-name"
                  placeholder="YOUR NAME" 
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-lg text-center font-bold"
                />
                <button 
                  onClick={() => {
                    const code = (document.getElementById('join-code') as HTMLInputElement).value.toUpperCase();
                    const name = (document.getElementById('join-name') as HTMLInputElement).value;
                    if (code && name) joinRoom(code, name);
                    else alert("Enter room code and name");
                  }}
                  className="btn-danger w-full"
                >
                  JOIN GAME
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-xs">
          Built for 10-50 players • Social Deduction • Real-time
        </div>
      </div>
    );
  }

  if (view === 'HOST') {
    return (
      <HostScreen 
        gameState={gameState} 
        onStart={startRoleAssignment}
        onForceEndVote={(targetId) => finalizeVotes(targetId)}
      />
    );
  }

  if (view === 'PLAYER' && localPlayerId) {
    const player = gameState.players.find(p => p.id === localPlayerId);
    if (!player) return <div>Player data lost. Rejoining...</div>;
    
    return (
      <PlayerScreen 
        player={player} 
        gameState={gameState} 
        onAction={saboteurAction}
        onVote={(targetId) => castVote(localPlayerId, targetId)}
      />
    );
  }

  return <div>Loading...</div>;
};

export default App;
