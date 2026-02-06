import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Link2, User, Copy, CheckCircle, Users, ArrowRight, Check, X, Share2, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useHackathonData, useCurrentTeam, type HackathonState } from '@/context/HackathonDataContext';

// States that allow team changes
const TEAM_CHANGE_ALLOWED_STATES: HackathonState[] = ['DRAFT', 'REGISTRATION_OPEN'];

const TeamFormationPage = () => {
  const navigate = useNavigate();
  const {
    currentState,
    currentUser,
    config,
    createTeam,
    joinTeam,
    leaveTeam,
    loginUser,
  } = useHackathonData();

  const { team: currentTeam, members: teamMembers } = useCurrentTeam();

  const [selectedMode, setSelectedMode] = useState<'create' | 'join' | 'solo' | null>(null);
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailInvites, setEmailInvites] = useState(['']);
  const [showEmailInvite, setShowEmailInvite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      // For demo purposes, auto-login as first user in a team
      const result = loginUser('anishk@example.com');
      if (!result.success) {
        toast.error('Please login first');
        navigate('/login');
      }
    }
  }, [currentUser, loginUser, navigate]);

  // If already in team, show team view
  const teamCreated = currentTeam !== null;

  // Check if team changes are allowed in current state
  const canModifyTeam = TEAM_CHANGE_ALLOWED_STATES.includes(currentState);
  const isTeamLocked = currentTeam?.isLocked || false;

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    if (!canModifyTeam) {
      toast.error('Team creation is not allowed in the current stage');
      return;
    }

    setIsLoading(true);
    const result = createTeam(teamName.trim());
    setIsLoading(false);

    if (result.success) {
      toast.success(`Team "${teamName}" created successfully!`);
      setTeamName('');
    } else {
      toast.error(result.error);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }

    if (!canModifyTeam) {
      toast.error('Joining teams is not allowed in the current stage');
      return;
    }

    setIsLoading(true);
    const result = joinTeam(inviteCode.trim().toUpperCase());
    setIsLoading(false);

    if (result.success) {
      toast.success('Successfully joined the team!');
      setInviteCode('');
      setSelectedMode(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleLeaveTeam = async () => {
    if (!canModifyTeam) {
      toast.error('Leaving teams is not allowed in the current stage');
      return;
    }

    if (isTeamLocked) {
      toast.error('Cannot leave team after submission');
      return;
    }

    setIsLoading(true);
    const result = leaveTeam();
    setIsLoading(false);

    if (result.success) {
      toast.success('You have left the team');
    } else {
      toast.error(result.error);
    }
  };

  const handleSolo = () => {
    toast.info('Continuing solo. You can join a team later from your dashboard.');
    navigate('/dashboard');
  };

  const copyCode = () => {
    if (currentTeam) {
      navigator.clipboard.writeText(currentTeam.inviteCode);
      setCopied(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addEmailField = () => {
    if (emailInvites.length < config.maxTeamSize - 1) {
      setEmailInvites([...emailInvites, '']);
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emailInvites];
    newEmails[index] = value;
    setEmailInvites(newEmails);
  };

  const removeEmailField = (index: number) => {
    const newEmails = emailInvites.filter((_, i) => i !== index);
    setEmailInvites(newEmails);
  };

  const sendInvites = () => {
    const validEmails = emailInvites.filter(e => e.trim());
    if (validEmails.length > 0) {
      // In real implementation, send emails via API
      toast.success(`Invites sent to: ${validEmails.join(', ')}`);
      setEmailInvites(['']);
      setShowEmailInvite(false);
    } else {
      toast.error('Please enter at least one email address');
    }
  };

  const shareOptions = currentTeam ? [
    { name: 'WhatsApp', action: () => window.open(`https://wa.me/?text=Join my team ${currentTeam.name} on GL Hackathon! Code: ${currentTeam.inviteCode}`) },
    { name: 'Email', action: () => window.open(`mailto:?subject=Join my GL Hackathon Team&body=Join my team ${currentTeam.name}! Code: ${currentTeam.inviteCode}`) },
    { name: 'Copy Link', action: copyCode }
  ] : [];

  // Show warning if not in allowed state
  const StateWarning = () => {
    if (!canModifyTeam) {
      return (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Team changes are locked</span>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            The hackathon is in "{currentState}" stage. Team modifications are not allowed.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <button
          onClick={() => teamCreated ? navigate('/dashboard') : navigate('/register')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {teamCreated ? 'Dashboard' : 'Back'}
        </button>
        <div className="font-display text-xl font-bold text-cyan tracking-wider">GL Hackathon</div>
        <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm">Logout</button>
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-5xl">
          {!teamCreated ? (
            <>
              <div className="text-center mb-12">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                  TEAM SETUP
                </h1>
                <p className="text-text-secondary">Choose how you want to participate</p>
              </div>

              <StateWarning />

              {/* Choice Cards */}
              {!selectedMode ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <Card
                    onClick={() => canModifyTeam && setSelectedMode('create')}
                    className={`bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow transition-all group ${
                      canModifyTeam
                        ? 'cursor-pointer hover:border-cyan/50 hover:-translate-y-2'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                      <Plus className="w-8 h-8 text-cyan" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">Create Team</h3>
                    <p className="text-text-secondary text-sm mb-4">Start a new team & invite members</p>
                    <div className="flex items-center gap-2 text-cyan text-sm">
                      <ArrowRight className="w-4 h-4" /> Get Started
                    </div>
                  </Card>

                  <Card
                    onClick={() => canModifyTeam && setSelectedMode('join')}
                    className={`bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow transition-all group ${
                      canModifyTeam
                        ? 'cursor-pointer hover:border-cyan/50 hover:-translate-y-2'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                      <Link2 className="w-8 h-8 text-cyan" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">Join Team</h3>
                    <p className="text-text-secondary text-sm mb-4">Have a code? Join here</p>
                    <div className="flex items-center gap-2 text-cyan text-sm">
                      <ArrowRight className="w-4 h-4" /> Enter Code
                    </div>
                  </Card>

                  <Card
                    onClick={() => setSelectedMode('solo')}
                    className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow cursor-pointer hover:border-cyan/50 transition-all hover:-translate-y-2 group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6 group-hover:bg-cyan/20 transition-colors">
                      <User className="w-8 h-8 text-cyan" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">Participate Solo</h3>
                    <p className="text-text-secondary text-sm mb-4">You can add team members later</p>
                    <div className="flex items-center gap-2 text-cyan text-sm">
                      <ArrowRight className="w-4 h-4" /> Continue
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedMode(null)}
                    className="mb-6 text-text-secondary hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to options
                  </Button>

                  {selectedMode === 'create' && (
                    <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow">
                      <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                        <Plus className="w-8 h-8 text-cyan" />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-white mb-2">Create Your Team</h2>
                      <p className="text-text-secondary mb-6">Give your team an awesome name</p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="teamName" className="text-white">Team Name*</Label>
                          <Input
                            id="teamName"
                            placeholder="e.g., Code Ninjas"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan"
                          />
                          <p className="text-text-secondary text-xs">Max team size: {config.maxTeamSize} members</p>
                        </div>
                        <Button
                          onClick={handleCreateTeam}
                          disabled={!teamName.trim() || isLoading || !canModifyTeam}
                          className="w-full h-12 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold rounded-xl disabled:opacity-50"
                        >
                          {isLoading ? 'Creating...' : 'Create Team'} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {selectedMode === 'join' && (
                    <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow">
                      <div className="w-16 h-16 rounded-2xl bg-cyan/10 flex items-center justify-center mb-6">
                        <Link2 className="w-8 h-8 text-cyan" />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-white mb-2">Join a Team</h2>
                      <p className="text-text-secondary mb-6">Enter the invite code shared by your team leader</p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="inviteCode" className="text-white">Invite Code*</Label>
                          <Input
                            id="inviteCode"
                            placeholder="e.g., NINJA-7X92"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="h-12 bg-navy-primary border-white/10 text-white placeholder:text-text-secondary/50 focus:border-cyan font-mono"
                          />
                        </div>
                        <Button
                          onClick={handleJoinTeam}
                          disabled={!inviteCode.trim() || isLoading || !canModifyTeam}
                          className="w-full h-12 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold rounded-xl disabled:opacity-50"
                        >
                          {isLoading ? 'Joining...' : 'Join Team'} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </Card>
                  )}

                  {selectedMode === 'solo' && (
                    <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow text-center">
                      <div className="w-20 h-20 rounded-full bg-cyan/10 flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-cyan" />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-white mb-4">Going Solo?</h2>
                      <p className="text-text-secondary mb-6">
                        No problem! You can always add team members later from your dashboard.
                      </p>
                      <div className="bg-navy-primary/50 rounded-xl p-4 mb-6 text-left">
                        <p className="text-text-secondary text-sm mb-2">What you get:</p>
                        <ul className="space-y-2 text-sm text-white">
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan" /> Full access to hackathon</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan" /> Can join teams later</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan" /> Eligible for all prizes</li>
                        </ul>
                      </div>
                      <Button
                        onClick={handleSolo}
                        className="w-full h-12 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold rounded-xl"
                      >
                        Continue Solo <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Team Created Success - Show current team */
            <div className="max-w-2xl mx-auto">
              <Card className="bg-navy-secondary border-cyan/50 rounded-3xl p-8 card-shadow">
                {/* Success Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-white mb-2">
                    Your Team
                  </h2>
                  <p className="text-text-secondary">
                    Team <span className="text-cyan font-semibold">{currentTeam.name}</span>
                    {isTeamLocked && (
                      <span className="ml-2 text-yellow-500 text-sm">(Locked after submission)</span>
                    )}
                  </p>
                </div>

                <StateWarning />

                {/* Team Code Section */}
                <div className="bg-navy-primary rounded-xl p-6 mb-6">
                  <p className="text-text-secondary text-sm mb-3">Share this code with your teammates:</p>
                  <div className="flex items-center justify-between bg-navy-secondary rounded-lg p-4">
                    <code className="text-3xl font-mono text-cyan font-bold tracking-wider">{currentTeam.inviteCode}</code>
                    <Button
                      variant="ghost"
                      onClick={copyCode}
                      className="text-text-secondary hover:text-cyan flex items-center gap-2"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  {/* Share Options */}
                  <div className="flex gap-2 mt-4">
                    {shareOptions.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={option.action}
                        className="flex-1 py-2 px-3 bg-navy-secondary rounded-lg text-text-secondary hover:text-cyan hover:bg-cyan/10 transition-all text-sm"
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Invite Section */}
                {canModifyTeam && !isTeamLocked && teamMembers.length < config.maxTeamSize && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowEmailInvite(!showEmailInvite)}
                      className="flex items-center gap-2 text-cyan hover:underline mb-4"
                    >
                      <Mail className="w-4 h-4" />
                      {showEmailInvite ? 'Hide email invites' : 'Invite via email'}
                    </button>

                    {showEmailInvite && (
                      <div className="bg-navy-primary rounded-xl p-4 space-y-3">
                        <p className="text-text-secondary text-sm">Enter email addresses (max {config.maxTeamSize - teamMembers.length}):</p>
                        {emailInvites.map((email, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              type="email"
                              placeholder={`Teammate ${idx + 1} email`}
                              value={email}
                              onChange={(e) => updateEmail(idx, e.target.value)}
                              className="flex-1 h-10 bg-navy-secondary border-white/10 text-white"
                            />
                            {emailInvites.length > 1 && (
                              <button
                                onClick={() => removeEmailField(idx)}
                                className="p-2 text-text-secondary hover:text-red-400"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {emailInvites.length < config.maxTeamSize - teamMembers.length && (
                          <button
                            onClick={addEmailField}
                            className="text-cyan text-sm hover:underline"
                          >
                            + Add another email
                          </button>
                        )}
                        <Button
                          onClick={sendInvites}
                          disabled={!emailInvites.some(e => e.trim())}
                          className="w-full h-10 bg-cyan/20 text-cyan hover:bg-cyan/30"
                        >
                          <Share2 className="w-4 h-4 mr-2" /> Send Invites
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Team Members */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-text-secondary text-sm">Team Members ({teamMembers.length}/{config.maxTeamSize}):</p>
                    {teamMembers.length >= config.maxTeamSize && (
                      <span className="text-yellow-500 text-xs">Team is full</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-navy-primary rounded-xl p-4">
                        <div className="w-10 h-10 rounded-full bg-cyan/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-cyan" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {member.name}
                            {member.id === currentUser?.id && <span className="text-cyan text-xs ml-2">(You)</span>}
                          </p>
                          <p className="text-text-secondary text-xs">{member.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.id === currentTeam.leaderId
                            ? 'bg-cyan/10 text-cyan'
                            : 'bg-white/10 text-text-secondary'
                        }`}>
                          {member.id === currentTeam.leaderId ? 'Leader' : 'Member'}
                        </span>
                      </div>
                    ))}
                    {Array.from({ length: config.maxTeamSize - teamMembers.length }).map((_, idx) => (
                      <div key={`empty-${idx}`} className="flex items-center gap-3 bg-navy-primary/30 rounded-xl p-4 border border-dashed border-white/20">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <User className="w-5 h-5 text-text-secondary" />
                        </div>
                        <span className="text-text-secondary text-sm">Waiting for member...</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {canModifyTeam && !isTeamLocked && currentUser?.id !== currentTeam.leaderId && (
                    <Button
                      variant="outline"
                      onClick={handleLeaveTeam}
                      disabled={isLoading}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      Leave Team
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 h-12 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold rounded-xl"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamFormationPage;
