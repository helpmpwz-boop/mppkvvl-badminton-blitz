import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddPlayer, CategoryType } from '@/hooks/usePlayers';
import { User, CheckCircle, Upload, Loader2 } from 'lucide-react';

const ALL_CATEGORIES: { value: CategoryType; label: string; group: 'singles' | 'doubles' | 'veteran-singles' | 'veteran-doubles' }[] = [
  { value: 'Mens Singles', label: "Men's Singles", group: 'singles' },
  { value: 'Womens Singles', label: "Women's Singles", group: 'singles' },
  { value: 'Mens Doubles', label: "Men's Doubles", group: 'doubles' },
  { value: 'Womens Doubles', label: "Women's Doubles", group: 'doubles' },
  { value: 'Mixed Doubles', label: 'Mixed Doubles', group: 'doubles' },
  { value: 'Veteran Mens Singles', label: "Veteran Men's Singles", group: 'veteran-singles' },
  { value: 'Veteran Womens Singles', label: "Veteran Women's Singles", group: 'veteran-singles' },
  { value: 'Veteran Mens Doubles', label: "Veteran Men's Doubles", group: 'veteran-doubles' },
  { value: 'Veteran Womens Doubles', label: "Veteran Women's Doubles", group: 'veteran-doubles' },
  { value: 'Veteran Mixed Doubles', label: 'Veteran Mixed Doubles', group: 'veteran-doubles' },
];

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  location: z.string().min(1, 'Location is required'),
  designation: z.string().min(1, 'Designation is required'),
  age: z.number().min(18, 'Must be at least 18 years old').max(70, 'Must be under 70 years old'),
  gender: z.enum(['Male', 'Female', 'Other']),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  team: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;
type Gender = 'Male' | 'Female' | 'Other';

export function RegistrationForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);
  const addPlayer = useAddPlayer();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      gender: 'Male',
      categories: [],
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (category: CategoryType) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    setValue('categories', newCategories, { shouldValidate: true });
  };

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await addPlayer.mutateAsync({
        name: data.name,
        employeeNumber: data.employeeNumber,
        location: data.location,
        designation: data.designation,
        age: data.age,
        gender: data.gender,
        category: selectedCategories,
        phone: data.phone,
        photoUrl: photoPreview || undefined,
        email: data.email || undefined,
        team: data.team || undefined,
      });
      
      setIsSubmitted(true);
      reset();
      setPhotoPreview(null);
      setSelectedCategories([]);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12 animate-slide-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Registration Complete!</h2>
        <p className="text-muted-foreground mb-6">
          Your registration has been submitted successfully.<br />
          Please wait for admin approval.
        </p>
        <Button onClick={() => setIsSubmitted(false)}>
          Register Another Player
        </Button>
      </div>
    );
  }

  const singlesCategories = ALL_CATEGORIES.filter(c => c.group === 'singles');
  const doublesCategories = ALL_CATEGORIES.filter(c => c.group === 'doubles');
  const veteranSinglesCategories = ALL_CATEGORIES.filter(c => c.group === 'veteran-singles');
  const veteranDoublesCategories = ALL_CATEGORIES.filter(c => c.group === 'veteran-doubles');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload */}
      {/* <div className="flex justify-center">
        <label className="cursor-pointer group">
          <div className="relative w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-dashed border-border group-hover:border-primary transition-colors">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                <Upload className="h-8 w-8 mb-1" />
                <span className="text-xs">Upload Photo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Employee Number */}
        <div className="space-y-2">
          <Label htmlFor="employeeNumber">Employee Number *</Label>
          <Input
            id="employeeNumber"
            placeholder="e.g., EMP001"
            {...register('employeeNumber')}
            className={errors.employeeNumber ? 'border-destructive' : ''}
          />
          {errors.employeeNumber && <p className="text-xs text-destructive">{errors.employeeNumber.message}</p>}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location/Office *</Label>
          <Input
            id="location"
            placeholder="e.g., Indore HQ"
            {...register('location')}
            className={errors.location ? 'border-destructive' : ''}
          />
          {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
        </div>

        {/* Designation */}
        <div className="space-y-2">
          <Label htmlFor="designation">Designation *</Label>
          <Input
            id="designation"
            placeholder="e.g., Senior Engineer"
            {...register('designation')}
            className={errors.designation ? 'border-destructive' : ''}
          />
          {errors.designation && <p className="text-xs text-destructive">{errors.designation.message}</p>}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            placeholder="Enter your age"
            {...register('age', { valueAsNumber: true })}
            className={errors.age ? 'border-destructive' : ''}
          />
          {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select onValueChange={(value) => setValue('gender', value as Gender)} defaultValue="Male">
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team */}
        <div className="space-y-2">
          <Label htmlFor="team">Team/Department (Optional)</Label>
          <Input
            id="team"
            placeholder="e.g., Engineering"
            {...register('team')}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            {...register('phone')}
            className={errors.phone ? 'border-destructive' : ''}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      {/* Categories Selection */}
      <div className="space-y-4">
        <Label className={errors.categories ? 'text-destructive' : ''}>
          Select Categories * <span className="text-muted-foreground font-normal">(You can register for multiple categories)</span>
        </Label>
        
        <div className="grid gap-4">
          {/* Singles */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-sm">Singles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {singlesCategories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat.value) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox 
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Doubles */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-sm">Doubles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {doublesCategories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat.value) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox 
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Veteran Singles */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-sm">Veteran Singles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {veteranSinglesCategories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat.value) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox 
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Veteran Doubles */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3 text-sm">Veteran Doubles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {veteranDoublesCategories.map(cat => (
                <label 
                  key={cat.value} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat.value) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox 
                    checked={selectedCategories.includes(cat.value)}
                    onCheckedChange={() => toggleCategory(cat.value)}
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {errors.categories && <p className="text-xs text-destructive">{errors.categories.message}</p>}
        
        {selectedCategories.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
          </p>
        )}
      </div>

      <Button type="submit" size="xl" className="w-full" disabled={addPlayer.isPending}>
        {addPlayer.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <User className="h-5 w-5" />
        )}
        {addPlayer.isPending ? 'Registering...' : 'Register for Tournament'}
      </Button>
    </form>
  );
}
