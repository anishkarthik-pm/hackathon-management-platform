import { useNavigate } from 'react-router-dom';
import { Gavel, ArrowRight, Code2, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'participant',
      title: 'Participant',
      description: 'Register as a hacker, form teams, and submit your project',
      icon: Code2,
      color: 'cyan',
      path: '/register?role=participant',
      features: ['Create/Join Teams', 'Submit Projects', 'View Leaderboard']
    },
    {
      id: 'judge',
      title: 'Judge',
      description: 'Review submissions, score projects, and provide feedback',
      icon: Gavel,
      color: 'purple',
      path: '/judge-login',
      features: ['Review Submissions', 'Score Projects', 'Provide Feedback']
    },
    {
      id: 'admin',
      title: 'Organizer',
      description: 'Manage the event, teams, and oversee the hackathon',
      icon: Trophy,
      color: 'green',
      path: '/admin-login',
      features: ['Manage Teams', 'View Analytics', 'Publish Results']
    }
  ];

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="font-display text-4xl font-bold text-cyan tracking-wider mb-4">GL</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            GL HACKATHON 2026
          </h1>
          <p className="text-text-secondary text-lg">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.id}
              onClick={() => navigate(role.path)}
              className={`bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow cursor-pointer 
                hover:border-${role.color}-500/50 transition-all hover:-translate-y-2 group`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-${role.color}-500/10 flex items-center justify-center mb-6 group-hover:bg-${role.color}-500/20 transition-colors`}>
                <role.icon className={`w-8 h-8 text-${role.color}-500`} />
              </div>
              
              <h2 className="font-display text-2xl font-bold text-white mb-3">
                {role.title}
              </h2>
              
              <p className="text-text-secondary text-sm mb-6">
                {role.description}
              </p>
              
              <div className="space-y-2 mb-6">
                {role.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${role.color}-500`} />
                    {feature}
                  </div>
                ))}
              </div>
              
              <button className={`w-full py-3 rounded-xl bg-${role.color}-500/10 text-${role.color}-500 font-medium flex items-center justify-center gap-2 group-hover:bg-${role.color}-500 group-hover:text-navy-primary transition-all`}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
