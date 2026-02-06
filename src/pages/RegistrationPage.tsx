import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface RegistrationPageProps {
  isLogin?: boolean;
}

const skills = [
  'Frontend', 'Backend', 'ML', 'Data', 'Design', 'DevOps', 'Other'
];

const RegistrationPage = ({ isLogin = false }: RegistrationPageProps) => {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 3) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      navigate('/dashboard');
    } else {
      navigate('/team-setup');
    }
  };

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-display text-xl font-bold text-cyan tracking-wider">GL Hackathon</div>
        <div className="w-16" />
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Photo Card */}
          <Card className="hidden lg:flex bg-navy-secondary border-white/10 rounded-3xl overflow-hidden card-shadow relative">
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1000&fit=crop" 
              alt="Developer" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h2 className="font-display text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back!' : 'Join the Future'}
              </h2>
              <p className="text-text-secondary">
                {isLogin ? 'Continue your hackathon journey.' : 'Build something amazing with us.'}
              </p>
            </div>
          </Card>

          {/* Right Form Panel */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-6">
              {isLogin ? 'LOGIN TO YOUR ACCOUNT' : 'CREATE YOUR ACCOUNT'}
            </h1>

            {/* Google Button */}
            <Button 
              variant="outline" 
              className="w-full h-12 bg-white text-navy-primary hover:bg-gray-100 font-medium rounded-xl mb-6"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-navy-secondary px-2 text-text-secondary">Or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name*</Label>
                  <Input 
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email*</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan"
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone*</Label>
                  <div className="flex">
                    <div className="h-12 px-4 bg-navy-primary border border-white/10 border-r-0 rounded-l-lg flex items-center text-text-secondary">
                      +91
                    </div>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan rounded-l-none"
                      required
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password*</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan"
                    required
                  />
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="space-y-3">
                    <Label className="text-white">Skills (Select up to 3)</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-cyan text-navy-primary'
                              : 'bg-navy-primary border border-white/20 text-text-secondary hover:border-cyan/50'
                          }`}
                        >
                          {selectedSkills.includes(skill) && <Check className="w-3 h-3 inline mr-1" />}
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="terms" 
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      className="border-white/30 data-[state=checked]:bg-cyan data-[state=checked]:border-cyan"
                    />
                    <Label htmlFor="terms" className="text-text-secondary text-sm cursor-pointer">
                      I agree to the <span className="text-cyan hover:underline">Terms & Conditions</span>
                    </Label>
                  </div>
                </>
              )}

              <Button 
                type="submit"
                className="w-full h-12 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-lg rounded-xl glow-cyan"
              >
                {isLogin ? 'Login' : 'Continue'} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <p className="text-center text-text-secondary text-sm mt-6">
              {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
              <button 
                onClick={() => navigate(isLogin ? '/register' : '/login')} 
                className="text-cyan hover:underline font-medium"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
