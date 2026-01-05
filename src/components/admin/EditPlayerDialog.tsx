import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Player, CategoryType, useUpdatePlayer } from '@/hooks/usePlayers';

interface EditPlayerDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allCategories: CategoryType[] = [
  'Mens Singles',
  'Womens Singles',
  'Mens Doubles',
  'Womens Doubles',
  'Mixed Doubles',
  'Veteran Mens Singles',
  'Veteran Womens Singles',
  'Veteran Mens Doubles',
  'Veteran Womens Doubles',
  'Veteran Mixed Doubles',
];

export function EditPlayerDialog({ player, open, onOpenChange }: EditPlayerDialogProps) {
  const updatePlayer = useUpdatePlayer();
  
  const [formData, setFormData] = useState({
    name: '',
    employeeNumber: '',
    location: '',
    designation: '',
    age: 0,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    category: [] as CategoryType[],
    team: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        employeeNumber: player.employeeNumber,
        location: player.location,
        designation: player.designation,
        age: player.age,
        gender: player.gender,
        category: player.category,
        team: player.team || '',
        phone: player.phone,
        email: player.email || '',
      });
    }
  }, [player]);

  const handleCategoryChange = (category: CategoryType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category: checked 
        ? [...prev.category, category]
        : prev.category.filter(c => c !== category)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    updatePlayer.mutate({
      playerId: player.id,
      data: formData,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeNumber">Employee Number *</Label>
              <Input
                id="employeeNumber"
                value={formData.employeeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeNumber: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v as 'Male' | 'Female' | 'Other' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="team">Team/Department</Label>
              <Input
                id="team"
                value={formData.team}
                onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Categories *</Label>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${cat}`}
                    checked={formData.category.includes(cat)}
                    onCheckedChange={(checked) => handleCategoryChange(cat, checked === true)}
                  />
                  <Label htmlFor={`edit-${cat}`} className="text-sm font-normal cursor-pointer">
                    {cat}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePlayer.isPending || formData.category.length === 0}>
              {updatePlayer.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
