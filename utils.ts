
import { Player, PlayerRole, GameState } from './types';

export const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const assignRoles = (players: Player[]): Player[] => {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const numSaboteurs = 2; // Always 2 for this version

  const saboteurs = shuffled.slice(0, numSaboteurs);
  const investigators = shuffled.slice(numSaboteurs);

  return [
    ...saboteurs.map(p => ({
      ...p,
      role: PlayerRole.SABOTEUR,
      partnerName: saboteurs.find(s => s.id !== p.id)?.name
    })),
    ...investigators.map(p => ({
      ...p,
      role: PlayerRole.INVESTIGATOR
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));
};

export const generateClue = (gameState: GameState, disabledId: string): string => {
  const disabled = gameState.players.find(p => p.id === disabledId);
  const saboteurs = gameState.players.filter(p => p.role === PlayerRole.SABOTEUR);
  
  const clues = [
    `The Saboteur selected someone from the ${disabledId.length % 2 === 0 ? 'top' : 'bottom'} half of the list.`,
    `A clue suggests the Saboteur's name has ${saboteurs[0].name.length % 2 === 0 ? 'even' : 'odd'} characters.`,
    `The frequency of the blackout suggests the intruder is among the first ${Math.ceil(gameState.players.length / 2)} players joined.`,
    `Electronic interference points to a Saboteur who ${Math.random() > 0.5 ? 'has' : 'has not'} voted in previous rounds.`,
    `Thermal signatures indicate the Saboteur is hidden near the ${Math.random() > 0.5 ? 'center' : 'edge'} of the group.`
  ];
  
  return clues[Math.floor(Math.random() * clues.length)];
};
