import * as XLSX from 'xlsx';
import { Player } from '@/hooks/usePlayers';
import { Match } from '@/hooks/useMatches';

export function downloadPlayersExcel(players: Player[], filename: string = 'players') {
  const data = players.map(p => ({
    'Name': p.name,
    'Employee Number': p.employeeNumber,
    'Location': p.location,
    'Designation': p.designation,
    'Age': p.age,
    'Gender': p.gender,
    'Phone': p.phone,
    'Email': p.email || '',
    'Team': p.team || '',
    'Categories': Array.isArray(p.category) ? p.category.join(', ') : p.category,
    'Status': p.status,
    'Registered At': p.registeredAt.toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Players');
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export interface WinnerData {
  playerName: string;
  team?: string;
  category: string;
  matchDate: string;
  opponent: string;
  score: string;
}

export function getWinnersFromMatches(matches: Match[]): WinnerData[] {
  const completedMatches = matches.filter(m => m.status === 'COMPLETED' && m.winner);
  
  return completedMatches.map(match => {
    const winner = match.winner!;
    const isTeamA = match.playerA.id === winner.id || match.playerA2?.id === winner.id;
    
    // Determine opponent name(s)
    let opponent: string;
    if (isTeamA) {
      opponent = match.playerB2 
        ? `${match.playerB.name} & ${match.playerB2.name}` 
        : match.playerB.name;
    } else {
      opponent = match.playerA2 
        ? `${match.playerA.name} & ${match.playerA2.name}` 
        : match.playerA.name;
    }

    // Winner name(s) for doubles
    let winnerName: string;
    if (isTeamA && match.playerA2) {
      winnerName = `${match.playerA.name} & ${match.playerA2.name}`;
    } else if (!isTeamA && match.playerB2) {
      winnerName = `${match.playerB.name} & ${match.playerB2.name}`;
    } else {
      winnerName = winner.name;
    }

    const score = `${match.setsWonA}-${match.setsWonB}`;

    return {
      playerName: winnerName,
      team: winner.team,
      category: match.category,
      matchDate: match.scheduledAt.toLocaleDateString(),
      opponent,
      score,
    };
  });
}

export function downloadWinnersExcel(
  matches: Match[], 
  options?: { 
    categoryFilter?: 'singles' | 'doubles' | 'all';
    teamFilter?: string;
  }
) {
  let winners = getWinnersFromMatches(matches);

  // Filter by category type
  if (options?.categoryFilter === 'singles') {
    winners = winners.filter(w => w.category.includes('Singles'));
  } else if (options?.categoryFilter === 'doubles') {
    winners = winners.filter(w => w.category.includes('Doubles'));
  }

  // Filter by team
  if (options?.teamFilter) {
    winners = winners.filter(w => w.team?.toLowerCase() === options.teamFilter?.toLowerCase());
  }

  if (winners.length === 0) {
    return false; // No data to export
  }

  const data = winners.map(w => ({
    'Winner': w.playerName,
    'Team': w.team || 'N/A',
    'Category': w.category,
    'Match Date': w.matchDate,
    'Opponent': w.opponent,
    'Score (Sets)': w.score,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Winners');
  
  const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 20) }));
  worksheet['!cols'] = colWidths;

  let filename = 'winners';
  if (options?.categoryFilter && options.categoryFilter !== 'all') {
    filename += `_${options.categoryFilter}`;
  }
  if (options?.teamFilter) {
    filename += `_${options.teamFilter.replace(/\s+/g, '_')}`;
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
  return true;
}

export function getUniqueTeams(players: Player[]): string[] {
  const teams = new Set<string>();
  players.forEach(p => {
    if (p.team) teams.add(p.team);
  });
  return Array.from(teams).sort();
}
