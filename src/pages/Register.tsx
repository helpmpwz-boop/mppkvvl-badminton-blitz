import { TournamentHeader } from '@/components/TournamentHeader';
import { RegistrationForm } from '@/components/RegistrationForm';
import { QrCode, UserPlus, CheckCircle, Clock, Shield } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen">
      <TournamentHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">PLAYER REGISTRATION</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Register for the Tournament
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join the MPPKVVCL INDORE Badminton Tournament 2024. Fill in your details below to register as a participant.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-gradient-card rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold mb-1">Easy Registration</h3>
              <p className="text-sm text-muted-foreground">Fill the form with your details and upload a photo</p>
            </div>
            <div className="bg-gradient-card rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display font-bold mb-1">Quick Approval</h3>
              <p className="text-sm text-muted-foreground">Admin will review and approve your registration</p>
            </div>
            <div className="bg-gradient-card rounded-xl p-4 border border-border">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-display font-bold mb-1">Secure Data</h3>
              <p className="text-sm text-muted-foreground">Your information is safe and confidential</p>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className="bg-gradient-card rounded-2xl border border-border p-6 md:p-8 card-shadow">
            <RegistrationForm />
          </div>

          {/* QR Code Section */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
              <QrCode className="h-5 w-5" />
              <span className="text-sm">Share Registration Link</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Use the QR code or share this page URL to invite other players to register
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
