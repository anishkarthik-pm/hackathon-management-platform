import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Trophy, MessageCircle, HelpCircle, Plus, Copy, Check, ExternalLink, LogOut, ChevronRight, Play, Lock, Eye, Award, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useHackathonData, useCurrentTeam, useCurrentSubmission, type HackathonState } from '@/context/HackathonDataContext';

const STATE_LABELS: Record<HackathonState, string> = {
  'DRAFT': 'Draft',
  'REGISTRATION_OPEN': 'Registration Open',
  'SUBMISSION_OPEN': 'Submissions Open',
  'JUDGING_OPEN': 'Judging',
  'RESULTS_PUBLISHED': 'Results',
};

const STATES_ORDER: HackathonState[] = ['DRAFT', 'REGISTRATION_OPEN', 'SUBMISSION_OPEN', 'JUDGING_OPEN', 'RESULTS_PUBLISHED'];

const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const {
    currentState,
    currentUser,
    config,
    loginUser,
  } = useHackathonData();

  const { team, members: teamMembers } = useCurrentTeam();
  const currentSubmission = useCurrentSubmission();

  const [copied, setCopied] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'support', text: 'Hi! How can we help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 22
  });

  // Auto-login for demo
  useEffect(() => {
    if (!currentUser) {
      const result = loginUser('anishk@example.com');
      if (!result.success) {
        toast.error('Please login first');
        navigate('/login');
      }
    }
  }, [currentUser, loginUser, navigate]);

  // Update countdown based on state
  useEffect(() => {
    if (currentState === 'SUBMISSION_OPEN') {
      setCountdown({ days: 0, hours: 18, minutes: 35, seconds: 22 });
    } else if (currentState === 'REGISTRATION_OPEN') {
      setCountdown({ days: 2, hours: 14, minutes: 35, seconds: 22 });
    }
  }, [currentState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { from: 'user', text: chatInput }]);
      setChatInput('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, { from: 'support', text: 'Thanks for reaching out! Our team will get back to you shortly.' }]);
      }, 1000);
    }
  };

  // Stage-specific quick links
  const getQuickLinks = () => {
    const baseLinks = [
      { icon: FileText, label: 'Problem Statement', onClick: () => navigate('/problem'), color: 'cyan', show: true },
      { icon: HelpCircle, label: 'FAQs', onClick: () => toast.info('FAQ section coming soon'), color: 'purple', show: true },
      { icon: MessageCircle, label: 'Support Chat', onClick: () => setShowSupportChat(true), color: 'pink', show: true },
    ];

    const stageLinks: Record<HackathonState, Array<{ icon: any, label: string, onClick: () => void, color: string }>> = {
      'DRAFT': [],
      'REGISTRATION_OPEN': [],
      'SUBMISSION_OPEN': [
        { icon: FileText, label: 'Submit Project', onClick: () => navigate('/submit'), color: 'green' },
      ],
      'JUDGING_OPEN': [
        { icon: Eye, label: 'View Submission', onClick: () => currentSubmission ? toast.info(`Submission: ${currentSubmission.title}`) : toast.error('No submission found'), color: 'blue' },
        { icon: Trophy, label: 'Leaderboard', onClick: () => navigate('/leaderboard'), color: 'yellow' },
      ],
      'RESULTS_PUBLISHED': [
        { icon: Trophy, label: 'View Results', onClick: () => navigate('/leaderboard'), color: 'yellow' },
        { icon: Award, label: 'Certificate', onClick: () => toast.info('Certificate download coming soon'), color: 'gold' },
      ],
    };

    return [...baseLinks.filter(l => l.show), ...(stageLinks[currentState] || [])];
  };

  const announcements = [
    { date: 'Jan 14', text: 'Reminder: Complete your team setup!', important: currentState === 'REGISTRATION_OPEN' },
    { date: 'Jan 12', text: 'Problem statements are now available', important: false },
    { date: 'Jan 10', text: 'Welcome to GL Hackathon 2024!', important: false },
  ];

  const resources = [
    { name: 'Hackathon Guide', type: 'PDF', size: '2.4 MB' },
    { name: 'API Documentation', type: 'Link', url: '#' },
    { name: 'Starter Templates', type: 'GitHub', url: '#' },
  ];

  // Get stage-specific content
  const getStageContent = () => {
    switch (currentState) {
      case 'DRAFT':
        return {
          title: 'GL Hackathon 2024',
          subtitle: 'Event is being prepared. Stay tuned!',
          action: null,
          showCountdown: false,
          banner: { type: 'info', text: 'The hackathon is currently in preparation mode.' }
        };
      case 'REGISTRATION_OPEN':
        return {
          title: 'Welcome to GL Hackathon 2024!',
          subtitle: team ? 'Your team is ready!' : 'Complete your team setup to get started',
          action: team ? { label: 'View Problem Statement', onClick: () => navigate('/problem') } : { label: 'Go to Team Setup', onClick: () => navigate('/team-setup') },
          showCountdown: true,
          countdownLabel: 'SUBMISSIONS OPEN IN',
          banner: { type: 'info', text: team ? '🎉 You have successfully registered!' : '👋 Welcome! Join or create a team to participate.' }
        };
      case 'SUBMISSION_OPEN':
        return {
          title: currentSubmission ? 'Project Submitted!' : 'Hackathon is LIVE! 🔥',
          subtitle: currentSubmission ? 'You can edit your submission until the deadline' : 'Time to build something amazing',
          action: { label: currentSubmission ? 'Edit Submission' : 'Submit Your Project', onClick: () => navigate('/submit') },
          showCountdown: true,
          countdownLabel: 'TIME REMAINING',
          banner: { type: currentSubmission ? 'info' : 'success', text: currentSubmission ? '✅ Project submitted! You can still edit until deadline.' : '🚀 Hackathon is live! Submit before deadline!' }
        };
      case 'JUDGING_OPEN':
        return {
          title: 'Under Review 🔍',
          subtitle: 'Judges are evaluating all submissions',
          action: { label: 'View Leaderboard', onClick: () => navigate('/leaderboard') },
          showCountdown: false,
          banner: { type: 'warning', text: '🔍 Judging in progress. Results will be announced soon!' }
        };
      case 'RESULTS_PUBLISHED':
        return {
          title: 'Results Are Out! 🎉',
          subtitle: 'Check the leaderboard to see the winners',
          action: { label: 'View Results', onClick: () => navigate('/leaderboard') },
          showCountdown: false,
          banner: { type: 'success', text: '🏆 Winners have been announced! Congratulations to all!' }
        };
      default:
        return {
          title: 'Welcome!',
          subtitle: '',
          action: null,
          showCountdown: false,
          banner: null
        };
    }
  };

  const stageContent = getStageContent();
  const quickLinks = getQuickLinks();
  const stageIndex = STATES_ORDER.indexOf(currentState);

  // Display team members
  const displayMembers = team ? teamMembers : [];

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="font-display text-xl font-bold text-cyan tracking-wider cursor-pointer" onClick={() => navigate('/')}>GL</div>
          <span className="text-text-secondary hidden sm:inline">Hackathon Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-sm font-medium">
            {STATE_LABELS[currentState]}
          </div>
          <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-cyan" />
          </div>
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stage Banner */}
          {stageContent.banner && (
            <div className={`mb-6 p-4 rounded-xl ${
              stageContent.banner.type === 'success' ? 'bg-green-500/20 border border-green-500/30' :
              stageContent.banner.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30' :
              stageContent.banner.type === 'info' ? 'bg-cyan/20 border border-cyan/30' :
              'bg-navy-secondary border border-white/10'
            }`}>
              <p className={`text-sm font-medium ${
                stageContent.banner.type === 'success' ? 'text-green-500' :
                stageContent.banner.type === 'warning' ? 'text-yellow-500' :
                stageContent.banner.type === 'info' ? 'text-cyan' :
                'text-white'
              }`}>
                {stageContent.banner.text}
              </p>
            </div>
          )}

          {/* No Team Warning */}
          {!team && currentState !== 'DRAFT' && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="text-yellow-500 text-sm font-medium">
                  You are not in a team. Join or create a team to participate fully.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/team-setup')}
                  className="ml-auto bg-yellow-500 text-navy-primary hover:bg-yellow-500/90"
                >
                  Join Team
                </Button>
              </div>
            </div>
          )}

          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                {stageContent.title}
              </h1>
              <p className="text-text-secondary">{stageContent.subtitle}</p>
            </div>
            {stageContent.action && (
              <Button onClick={stageContent.action.onClick} className="bg-cyan text-navy-primary hover:bg-cyan/90">
                {stageContent.action.label} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Countdown Card */}
          {stageContent.showCountdown && (
            <Card className="bg-gradient-to-r from-navy-secondary to-navy-primary border-cyan/30 rounded-3xl p-8 card-shadow mb-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-text-secondary text-sm font-mono uppercase tracking-wider">
                  ⏱️ {stageContent.countdownLabel}
                </p>
                <Button variant="ghost" size="sm" onClick={() => navigate('/problem')} className="text-cyan hover:text-cyan/80">
                  View Details <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4 max-w-2xl">
                {[
                  { value: countdown.days, label: 'Days' },
                  { value: countdown.hours, label: 'Hrs' },
                  { value: countdown.minutes, label: 'Mins' },
                  { value: countdown.seconds, label: 'Secs' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-navy-primary rounded-2xl p-4 md:p-6 border border-white/10">
                      <div className="font-display text-3xl md:text-5xl font-bold text-cyan">
                        {String(item.value).padStart(2, '0')}
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Stage Timeline */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-6">HACKATHON PROGRESS</h2>
            <div className="flex items-center justify-between">
              {STATES_ORDER.map((state, index) => {
                const isCompleted = index < stageIndex;
                const isActive = state === currentState;

                return (
                  <div key={state} className="flex flex-col items-center relative">
                    {index < STATES_ORDER.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          isCompleted ? 'bg-cyan' : 'bg-white/10'
                        }`}
                        style={{ width: 'calc(100% + 20px)' }}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        isActive
                          ? 'bg-cyan text-navy-primary ring-4 ring-cyan/30'
                          : isCompleted
                            ? 'bg-cyan text-navy-primary'
                            : 'bg-navy-primary border-2 border-white/20 text-text-secondary'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-[80px] ${
                      isActive ? 'text-cyan font-medium' : isCompleted ? 'text-white' : 'text-text-secondary'
                    }`}>
                      {STATE_LABELS[state]}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Two Column Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Team Card */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {team ? `TEAM: ${team.name}` : 'NO TEAM'}
                  </h2>
                  <p className="text-text-secondary text-sm">
                    {team ? 'Manage your team members' : 'Join or create a team'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm bg-navy-primary px-3 py-1 rounded-full">
                  <Users className="w-4 h-4" />
                  {team ? `${displayMembers.length}/${config.maxTeamSize}` : '0/4'}
                </div>
              </div>

              {team ? (
                <>
                  <div className="space-y-3 mb-6">
                    {displayMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-3 bg-navy-primary/50 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-cyan" />
                        </div>
                        <div className="flex-1">
                          <span className="text-white">{member.name}</span>
                          {member.id === currentUser?.id && <span className="text-cyan text-xs ml-2">(You)</span>}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.id === team.leaderId ? 'bg-cyan/10 text-cyan' : 'bg-white/10 text-text-secondary'
                        }`}>
                          {member.id === team.leaderId ? 'Leader' : 'Member'}
                        </span>
                      </div>
                    ))}
                    {displayMembers.length < config.maxTeamSize && currentState !== 'RESULTS_PUBLISHED' && currentState !== 'JUDGING_OPEN' && (
                      <button
                        onClick={() => navigate('/team-setup')}
                        className="w-full flex items-center gap-3 bg-navy-primary/30 rounded-xl p-3 border border-dashed border-white/20 hover:border-cyan/50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-cyan" />
                        </div>
                        <span className="text-text-secondary">Add Member ({config.maxTeamSize - displayMembers.length} slot{config.maxTeamSize - displayMembers.length > 1 ? 's' : ''})</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-navy-primary rounded-xl p-4">
                    <p className="text-text-secondary text-sm mb-2">Team Invite Code:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-xl font-mono text-cyan font-bold tracking-wider">{team.inviteCode}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyCode}
                        className="text-text-secondary hover:text-cyan"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? ' Copied!' : ' Copy'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-4">You haven't joined a team yet.</p>
                  <Button onClick={() => navigate('/team-setup')} className="bg-cyan text-navy-primary">
                    Join or Create Team
                  </Button>
                </div>
              )}
            </Card>

            {/* Status Card */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">YOUR STATUS</h2>
                {currentState === 'SUBMISSION_OPEN' && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/submit')} className="text-cyan hover:text-cyan/80">
                    {currentSubmission ? 'Edit' : 'Submit'}
                  </Button>
                )}
              </div>

              {/* Stage Steps */}
              <div className="space-y-3">
                {STATES_ORDER.map((state, index) => {
                  const isCompleted = index < stageIndex;
                  const isActive = state === currentState;

                  return (
                    <div key={state} className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-500/20 text-green-500'
                          : isActive
                            ? 'bg-cyan/20 text-cyan'
                            : 'bg-white/10 text-text-secondary'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : isActive ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        isActive ? 'text-cyan font-medium' : isCompleted ? 'text-white' : 'text-text-secondary'
                      }`}>{STATE_LABELS[state]}</span>
                      {isActive && (
                        <span className="text-cyan text-xs ml-auto px-2 py-0.5 bg-cyan/10 rounded-full">Current</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Overall Progress</span>
                  <span className="text-cyan font-bold">{Math.round(((stageIndex + 1) / STATES_ORDER.length) * 100)}%</span>
                </div>
                <Progress value={((stageIndex + 1) / STATES_ORDER.length) * 100} className="h-2 bg-navy-primary" />
              </div>

              {/* Submission Status */}
              {currentSubmission && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-text-secondary text-sm mb-2">Your Submission</p>
                  <p className="text-white font-medium">{currentSubmission.title}</p>
                  <p className="text-text-secondary text-xs mt-1">
                    {currentSubmission.isLocked ? '🔒 Locked' : '✏️ Editable'}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">QUICK LINKS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
                >
                  <link.icon className={`w-6 h-6 text-${link.color}-500 group-hover:scale-110 transition-transform`} />
                  <span className="text-text-secondary text-sm text-center">{link.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Announcements */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">📢 ANNOUNCEMENTS</h2>
              </div>
              <div className="space-y-3">
                {announcements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-3 bg-navy-primary/50 rounded-xl p-4">
                    <span className="text-cyan text-sm font-mono whitespace-nowrap">[{announcement.date}]</span>
                    <div>
                      <span className="text-text-secondary text-sm">{announcement.text}</span>
                      {announcement.important && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Important</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resources */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <h2 className="font-display text-lg font-bold text-white mb-4">📚 RESOURCES</h2>
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between bg-navy-primary/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-cyan" />
                      <div>
                        <p className="text-white text-sm">{resource.name}</p>
                        <p className="text-text-secondary text-xs">{resource.type}{resource.size ? ` • ${resource.size}` : ''}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resource.url ? window.open(resource.url, '_blank') : toast.info(`Downloading ${resource.name}...`)}
                      className="text-cyan hover:text-cyan/80"
                    >
                      {resource.url ? <ExternalLink className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Support Chat Dialog */}
      {showSupportChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-navy-secondary border border-white/10 rounded-2xl shadow-2xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan" />
              <span className="text-white font-medium">Support Chat</span>
            </div>
            <button onClick={() => setShowSupportChat(false)} className="text-text-secondary hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.from === 'user' ? 'bg-cyan text-navy-primary' : 'bg-navy-primary text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-navy-primary border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan outline-none"
            />
            <Button size="sm" onClick={sendChatMessage} className="bg-cyan text-navy-primary">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
