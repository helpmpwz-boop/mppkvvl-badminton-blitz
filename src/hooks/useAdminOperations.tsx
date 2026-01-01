import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreateUserParams {
  email: string;
  password: string;
  fullName: string;
  role: AppRole;
}

interface BulkUploadParams {
  csvContent: string;
  autoApprove?: boolean;
}

interface UserWithRole {
  id: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  createdAt: Date;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');
      
      if (rolesError) throw rolesError;

      // Get profiles for names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      if (profilesError) throw profilesError;

      // Map users with their roles
      const users: UserWithRole[] = roles.map(role => {
        const profile = profiles.find(p => p.id === role.user_id);
        return {
          id: role.user_id,
          email: profile?.email || 'Unknown',
          fullName: profile?.full_name || null,
          role: role.role,
          createdAt: new Date(role.created_at),
        };
      });

      return users;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password, fullName, role }: CreateUserParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('create-user', {
        body: { email, password, fullName, role },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'User Created',
        description: `Successfully created user ${data.user.email} with ${data.user.role} role.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Create User',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBulkUploadPlayers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ csvContent, autoApprove }: BulkUploadParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('bulk-upload-players', {
        body: { csvContent, autoApprove },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: 'Bulk Upload Complete',
        description: `Successfully imported ${data.inserted} players${data.failed > 0 ? `, ${data.failed} failed` : ''}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Bulk Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
