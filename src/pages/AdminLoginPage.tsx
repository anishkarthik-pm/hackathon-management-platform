import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, validate credentials here
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <button 
          onClick={() => navigate('/select-role')} 
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-display text-xl font-bold text-cyan tracking-wider">GL Hackathon</div>
        <div className="w-16" />
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <Shield className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-white text-center mb-2">
              Organizer Login
            </h1>
            <p className="text-text-secondary text-center mb-8">
              Sign in to manage the hackathon event
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email*</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-green-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password*</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-green-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                  <input type="checkbox" className="rounded border-white/30 bg-navy-primary" />
                  Remember me
                </label>
                <button type="button" className="text-green-500 hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 bg-green-500 text-white hover:bg-green-600 font-display font-bold text-lg rounded-xl"
              >
                Login as Organizer <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <div className="mt-6 p-4 bg-green-500/10 rounded-xl">
              <p className="text-green-500 text-sm text-center">
                <strong>Demo Credentials:</strong><br />
                Email: admin@glhackathon.com<br />
                Password: admin123
              </p>
            </div>

            <p className="text-center text-text-secondary text-sm mt-6">
              Not an organizer?{' '}
              <button 
                onClick={() => navigate('/select-role')} 
                className="text-green-500 hover:underline font-medium"
              >
                Select different role
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
