import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBulkUploadPlayers } from '@/hooks/useAdminOperations';
import { Upload, Loader2, FileText, Download } from 'lucide-react';

export function CSVUploadForm() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const bulkUpload = useBulkUploadPlayers();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else if (file) {
      // Also accept .csv files that might have wrong MIME type
      if (file.name.endsWith('.csv')) {
        setCsvFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!csvFile) return;
    
    const content = await csvFile.text();
    
    bulkUpload.mutate(
      { csvContent: content, autoApprove },
      {
        onSuccess: () => {
          setCsvFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      }
    );
  };

  const downloadTemplate = () => {
    const template = `name,employee_number,location,designation,age,gender,category,team,phone,email
John Doe,EMP001,New York,Manager,30,Male,Mens Singles,Team A,+1234567890,john@example.com
Jane Smith,EMP002,Los Angeles,Developer,28,Female,Womens Singles,Team B,+0987654321,jane@example.com`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'player_registration_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">CSV Format</h4>
          <p className="text-sm text-muted-foreground">
            Required columns: name, employee_number, phone. Optional: location, designation, age, gender, category, team, email
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="csvFile">Upload CSV File</Label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileText className="h-4 w-4 mr-2" />
              {csvFile ? csvFile.name : 'Choose CSV File'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="autoApprove">Auto-approve Players</Label>
          <div className="flex items-center gap-2 h-10">
            <Switch
              id="autoApprove"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
            <span className="text-sm text-muted-foreground">
              {autoApprove ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handleUpload}
          disabled={!csvFile || bulkUpload.isPending}
          className="w-full"
        >
          {bulkUpload.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload Players
        </Button>
      </div>
    </div>
  );
}
