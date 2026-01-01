import { useUsers, useUpdateUserRole } from '@/hooks/useAdminOperations';
import { CreateUserForm } from './CreateUserForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, Shield, Users as UsersIcon, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type AppRole = Database['public']['Enums']['app_role'];

const roleConfig: Record<AppRole, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  admin: { label: 'Admin', variant: 'default', icon: <Shield className="h-3 w-3" /> },
  moderator: { label: 'Moderator', variant: 'secondary', icon: <UsersIcon className="h-3 w-3" /> },
  user: { label: 'User', variant: 'outline', icon: <User className="h-3 w-3" /> },
};

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, role: newRole });
  };

  return (
    <div className="space-y-8">
      {/* Create User Form */}
      <div className="bg-gradient-card rounded-xl border border-border p-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Create New User
        </h3>
        <CreateUserForm />
      </div>

      {/* Users Table */}
      <div className="bg-gradient-card rounded-xl border border-border p-6">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-primary" />
          Existing Users
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const config = roleConfig[user.role];
                const isCurrentUser = user.id === currentUser?.id;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName || 'N/A'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v as AppRole)}
                        disabled={isCurrentUser || updateRole.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
