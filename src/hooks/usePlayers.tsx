import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type PlayerRow = Database['public']['Tables']['players']['Row'];
type PlayerInsert = Database['public']['Tables']['players']['Insert'];
type PlayerStatus = Database['public']['Enums']['player_status'];

export type CategoryType = 'Mens Singles' | 'Womens Singles' | 'Mens Doubles' | 'Womens Doubles' | 'Mixed Doubles' | 'Veteran Mens Singles' | 'Veteran Womens Singles' | 'Veteran Mens Doubles' | 'Veteran Womens Doubles' | 'Veteran Mixed Doubles';

export interface Player {
  id: string;
  name: string;
  employeeNumber: string;
  location: string;
  designation: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  category: CategoryType[];
  team?: string;
  photoUrl?: string;
  phone: string;
  email?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredAt: Date;
}

const mapRowToPlayer = (row: PlayerRow): Player => ({
  id: row.id,
  name: row.name,
  employeeNumber: row.employee_number,
  location: row.location,
  designation: row.designation,
  age: row.age,
  gender: row.gender as Player['gender'],
  category: (row.category as CategoryType[]) ?? [],
  team: row.team ?? undefined,
  photoUrl: row.photo_url ?? undefined,
  phone: row.phone,
  email: row.email ?? undefined,
  status: row.status as Player['status'],
  registeredAt: new Date(row.registered_at),
});

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      // Avoid fetching huge base64 photos; we only pull the fields used across the app.
      const { data, error } = await supabase
        .from('players')
        .select(
          [
            'id',
            'name',
            'employee_number',
            'location',
            'designation',
            'age',
            'gender',
            'category',
            'team',
            // 'photo_url', // intentionally omitted for performance
            'phone',
            'email',
            'status',
            'registered_at',
            'created_at',
            'updated_at',
          ].join(',')
        )
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return ((data ?? []) as unknown as PlayerRow[]).map(mapRowToPlayer);
    },
  });
}

export function useAddPlayer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (player: Omit<Player, 'id' | 'status' | 'registeredAt'>) => {
      const insert: PlayerInsert = {
        name: player.name,
        employee_number: player.employeeNumber,
        location: player.location,
        designation: player.designation,
        age: player.age,
        gender: player.gender,
        category: player.category,
        team: player.team,
        photo_url: player.photoUrl,
        phone: player.phone,
        email: player.email,
      };

      const { data, error } = await supabase
        .from('players')
        .insert(insert)
        .select()
        .single();
      
      if (error) throw error;
      return mapRowToPlayer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Registration Successful!",
        description: "Your registration is pending admin approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePlayerStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playerId, status }: { playerId: string; status: PlayerStatus }) => {
      const { error } = await supabase
        .from('players')
        .update({ status })
        .eq('id', playerId);
      
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: status === 'APPROVED' ? "Player Approved" : "Player Rejected",
        description: status === 'APPROVED' 
          ? "The player has been approved for the tournament."
          : "The player registration has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
