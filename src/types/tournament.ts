export type PlayerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';
export type Gender = 'Male' | 'Female' | 'Other';
export type Category = 'Mens Singles' | 'Womens Singles' | 'Mens Doubles' | 'Womens Doubles' | 'Mixed Doubles';

export interface Player {
  id: string;
  name: string;
  employeeNumber: string;
  location: string;
  designation: string;
  age: number;
  gender: Gender;
  category: Category;
  team?: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  status: PlayerStatus;
  registeredAt: Date;
}

export interface Match {
  id: string;
  playerA: Player;
  playerB: Player;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  winner?: Player;
  scheduledAt: Date;
  court?: string;
  category: Category;
}
