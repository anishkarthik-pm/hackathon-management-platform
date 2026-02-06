import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Download, FileText, Code, Layout, ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ProblemStatementPage = () => {
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 18,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const challenges = [
    {
      number: '1',
      title: 'Personalized Learning Paths',
      description: 'Create a system that adapts to individual learning styles and paces.',
      icon: Layout
    },
    {
      number: '2',
      title: 'Gamified Skill Assessment',
      description: 'Design an engaging way to assess and track skill development.',
      icon: Trophy
    },
    {
      number: '3',
      title: 'Open Innovation',
      description: 'Propose your own EdTech solution with clear problem definition.',
      icon: Code
    }
  ];

  const resources = [
    { icon: Download, label: 'Dataset (CSV)' },
    { icon: FileText, label: 'API Documentation' },
    { icon: Code, label: 'Starter Template' },
  ];

  const judgingCriteria = [
    { criteria: 'Innovation', weight: '25%' },
    { criteria: 'Execution', weight: '25%' },
    { criteria: 'Presentation', weight: '20%' },
    { criteria: 'Impact', weight: '20%' },
    { criteria: 'Code Quality', weight: '10%' },
  ];

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <div className="font-display text-xl font-bold text-cyan tracking-wider">GL Hackathon</div>
        <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm">Logout</button>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Timer Bar */}
          <Card className="bg-navy-secondary border-cyan/30 rounded-2xl p-4 card-shadow mb-8">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-cyan" />
              <span className="text-text-secondary">TIME REMAINING:</span>
              <span className="font-mono text-xl text-cyan font-bold">
                {String(timeRemaining.hours).padStart(2, '0')}:
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
            </div>
          </Card>

          {/* Theme Title */}
          <div className="text-center mb-12">
            <p className="text-text-secondary text-sm font-mono uppercase tracking-wider mb-4">
              THEME
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Sustainable <span className="text-cyan">EdTech</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Build an innovative solution that addresses one of the following challenges in education:
            </p>
          </div>

          {/* Challenges */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {challenges.map((challenge, index) => (
              <Card 
                key={index} 
                className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow hover:border-cyan/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
                  <challenge.icon className="w-6 h-6 text-cyan" />
                </div>
                <div className="text-cyan text-sm font-mono mb-2">Challenge {challenge.number}</div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-text-secondary text-sm">{challenge.description}</p>
              </Card>
            ))}
          </div>

          {/* Resources */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">📎 RESOURCES</h2>
            <div className="flex flex-wrap gap-3">
              {resources.map((resource, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-primary rounded-lg text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all"
                >
                  <resource.icon className="w-4 h-4" />
                  {resource.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Judging Criteria */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-6">📝 JUDGING CRITERIA</h2>
            <div className="overflow-hidden rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-primary">
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Criteria</th>
                    <th className="text-right text-text-secondary font-medium py-3 px-4">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {judgingCriteria.map((item, index) => (
                    <tr key={index} className="border-t border-white/5">
                      <td className="text-white py-3 px-4">{item.criteria}</td>
                      <td className="text-cyan font-mono text-right py-3 px-4">{item.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/submit')}
              className="h-14 px-8 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-lg rounded-xl glow-cyan"
            >
              Go to Submission Page <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatementPage;
