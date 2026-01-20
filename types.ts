
export enum GamePhase {
  LOBBY = 'LOBBY',
  ROLE_ASSIGNMENT = 'ROLE_ASSIGNMENT',
  ACTION = 'ACTION',
  DISCUSSION = 'DISCUSSION',
  VOTE = 'VOTE',
  REVEAL = 'REVEAL',
  GAME_OVER = 'GAME_OVER'
}

export enum PlayerRole {
  SABOTEUR = 'SABOTEUR',
  INVESTIGATOR = 'INVESTIGATOR',
  PENDING = 'PENDING'
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  isDisabled: boolean; // Cannot vote or act, but can speak
  isDetained: boolean; // Out of the game
  hasVoted: boolean;
  partnerName?: string;
}

export interface Clue {
  id: string;
  text: string;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  timer: number;
  currentClue?: string;
  lastDisabledPlayer?: string;
  lastDetainedPlayer?: string;
  winner?: 'SABOTEURS' | 'INVESTIGATORS';
}

export interface VoteData {
  voterId: string;
  targetId: string;
}
