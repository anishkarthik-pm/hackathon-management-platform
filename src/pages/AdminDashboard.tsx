import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CheckCircle, Trophy, UserCog, Send, Circle, LogOut, Download, RefreshCw, Play, Lock, RotateCcw, Ban, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useHackathonData, type HackathonState } from '@/context/HackathonDataContext';

// State display mapping
const STATE_LABELS: Record<HackathonState, string> = {
  'DRAFT': 'Draft',
  'REGISTRATION_OPEN': 'Registration Open',
  'SUBMISSION_OPEN': 'Submissions Open',
  'JUDGING_OPEN': 'Judging Open',
  'RESULTS_PUBLISHED': 'Results Published',
};

const STATE_COLORS: Record<HackathonState, string> = {
  'DRAFT': 'text-gray-500',
  'REGISTRATION_OPEN': 'text-yellow-500',
  'SUBMISSION_OPEN': 'text-green-500',
  'JUDGING_OPEN': 'text-purple-500',
  'RESULTS_PUBLISHED': 'text-cyan',
};

const STATES_ORDER: HackathonState[] = ['DRAFT', 'REGISTRATION_OPEN', 'SUBMISSION_OPEN', 'JUDGING_OPEN', 'RESULTS_PUBLISHED'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    currentState,
    config,
    transitionState,
    getAllTeams,
    getAllSubmissions,
    getAllScores,
    getJudges,
    getTeamMembers,
    disqualifyTeam,
    reinstateTeam,
    lockSubmission,
    unlockSubmission,
    autoAssignJudges,
    exportTeamsCSV,
    exportSubmissionsCSV,
    exportScoresCSV,
    getScoresForSubmission,
    calculateAverageScore,
    resetAllData,
    refresh,
  } = useHackathonData();

  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showJudgesModal, setShowJudgesModal] = useState(false);

  // Get data
  const teams = getAllTeams();
  const submissions = getAllSubmissions();
  const scores = getAllScores();
  const judges = getJudges();

  // Calculate stats
  const totalTeams = teams.length;
  const submittedTeams = submissions.length;
  const scoredSubmissions = submissions.filter(s => getScoresForSubmission(s.id).length > 0).length;
  const totalPossibleScores = submissions.length * judges.length;
  const completedScores = scores.length;
  const judgingProgress = totalPossibleScores > 0 ? Math.round((completedScores / totalPossibleScores) * 100) : 0;

  const overviewStats = [
    { label: 'TEAMS', value: totalTeams, sublabel: `Registered / ${config.maxTeams}`, icon: Users, color: 'cyan', action: () => setShowTeamsModal(true) },
    { label: 'SUBMISSIONS', value: submittedTeams, sublabel: 'Received', icon: FileText, color: 'green', action: () => setShowSubmissionsModal(true) },
    { label: 'JUDGING', value: `${scoredSubmissions}/${submittedTeams}`, sublabel: `Scored (${judgingProgress}%)`, icon: CheckCircle, color: 'yellow', action: () => setShowJudgesModal(true) },
    { label: 'JUDGES', value: judges.length, sublabel: 'Active', icon: UserCog, color: 'purple', action: () => setShowJudgesModal(true) },
  ];

  // Get judge progress
  const judgeProgress = judges.map(judge => {
    const judgeScores = scores.filter(s => s.judgeId === judge.id);
    return {
      judge: judge.name,
      done: judgeScores.length,
      pending: submittedTeams - judgeScores.length,
    };
  });

  // Get recent activity (mock for now, would be from activity log in real implementation)
  const recentActivity = [
    { time: '2 min ago', text: 'Admin dashboard loaded', type: 'info' },
    { time: '5 min ago', text: `Current state: ${STATE_LABELS[currentState]}`, type: 'state' },
    { time: '10 min ago', text: `${totalTeams} teams registered`, type: 'info' },
  ];

  const sendNotification = () => {
    if (notificationText.trim()) {
      toast.success(`Notification sent to all participants`);
      setNotificationText('');
      setShowNotificationDialog(false);
    }
  };

  // Handle state transition
  const handleStateTransition = (newState: HackathonState) => {
    const result = transitionState(newState);
    if (result.success) {
      toast.success(`State changed to ${STATE_LABELS[newState]}`);
    } else {
      toast.error(result.error);
    }
  };

  // Handle CSV export
  const handleExportCSV = (type: 'teams' | 'submissions' | 'scores') => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'teams':
        csvContent = exportTeamsCSV();
        filename = 'hackathon_teams.csv';
        break;
      case 'submissions':
        csvContent = exportSubmissionsCSV();
        filename = 'hackathon_submissions.csv';
        break;
      case 'scores':
        csvContent = exportScoresCSV();
        filename = 'hackathon_scores.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Exported ${filename}`);
  };

  // Handle team disqualification
  const handleDisqualifyTeam = (teamId: string) => {
    const result = disqualifyTeam(teamId);
    if (result.success) {
      toast.success('Team disqualified');
    } else {
      toast.error(result.error);
    }
  };

  // Handle team reinstatement
  const handleReinstateTeam = (teamId: string) => {
    const result = reinstateTeam(teamId);
    if (result.success) {
      toast.success('Team reinstated');
    } else {
      toast.error(result.error);
    }
  };

  // Handle submission lock/unlock
  const handleToggleSubmissionLock = (submissionId: string, isLocked: boolean) => {
    const result = isLocked ? unlockSubmission(submissionId) : lockSubmission(submissionId);
    if (result.success) {
      toast.success(isLocked ? 'Submission unlocked' : 'Submission locked');
    } else {
      toast.error(result.error);
    }
  };

  // Handle auto-assign judges
  const handleAutoAssignJudges = () => {
    const result = autoAssignJudges();
    if (result.success) {
      toast.success(`Assigned ${result.data} judge-submission pairs`);
    } else {
      toast.error(result.error);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (confirm('Are you sure you want to reset ALL hackathon data? This cannot be undone.')) {
      resetAllData();
      toast.success('Hackathon data reset');
      refresh();
    }
  };

  // Get stage control actions based on current state
  const getStageControls = () => {
    switch (currentState) {
      case 'DRAFT':
        return {
          primary: { label: 'Open Registration', action: () => handleStateTransition('REGISTRATION_OPEN'), icon: Play },
          secondary: null
        };
      case 'REGISTRATION_OPEN':
        return {
          primary: { label: 'Open Submissions', action: () => handleStateTransition('SUBMISSION_OPEN'), icon: Play },
          secondary: { label: 'Back to Draft', action: () => handleStateTransition('DRAFT'), icon: RotateCcw }
        };
      case 'SUBMISSION_OPEN':
        return {
          primary: { label: 'Start Judging', action: () => handleStateTransition('JUDGING_OPEN'), icon: Lock },
          secondary: { label: 'Back to Registration', action: () => handleStateTransition('REGISTRATION_OPEN'), icon: RotateCcw }
        };
      case 'JUDGING_OPEN':
        return {
          primary: { label: 'Publish Results', action: () => handleStateTransition('RESULTS_PUBLISHED'), icon: Trophy },
          secondary: { label: 'Reopen Submissions', action: () => handleStateTransition('SUBMISSION_OPEN'), icon: RotateCcw }
        };
      case 'RESULTS_PUBLISHED':
        return {
          primary: { label: 'Reset Event', action: handleReset, icon: RotateCcw },
          secondary: null
        };
      default:
        return { primary: null, secondary: null };
    }
  };

  const stageControls = getStageControls();

  const currentStateIndex = STATES_ORDER.indexOf(currentState);

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="font-display text-xl font-bold text-cyan tracking-wider cursor-pointer" onClick={() => navigate('/')}>GL</div>
          <span className="text-text-secondary hidden sm:inline">Admin Portal - GL Hackathon</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full border ${STATE_COLORS[currentState]} border-current/30 bg-current/10 text-sm font-medium`}>
            {STATE_LABELS[currentState]}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
            <Circle className="w-3 h-3 text-green-500 fill-green-500" />
            <span className="text-green-500 text-sm font-medium">LIVE</span>
          </div>
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                Admin Dashboard
              </h1>
              <p className="text-text-secondary">Manage {config.name}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => refresh()} className="border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <div className="relative group">
                <Button className="bg-cyan text-navy-primary hover:bg-cyan/90">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-navy-secondary border border-white/10 rounded-xl shadow-lg z-10 hidden group-hover:block">
                  <button onClick={() => handleExportCSV('teams')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-t-xl">
                    Export Teams CSV
                  </button>
                  <button onClick={() => handleExportCSV('submissions')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10">
                    Export Submissions CSV
                  </button>
                  <button onClick={() => handleExportCSV('scores')} className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-b-xl">
                    Export Scores CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Control Panel */}
          <Card className="bg-navy-secondary border-cyan/30 rounded-3xl p-6 card-shadow mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white mb-1">EVENT STAGE CONTROL</h2>
                <p className="text-text-secondary text-sm">Current: <span className={`font-medium ${STATE_COLORS[currentState]}`}>{STATE_LABELS[currentState]}</span></p>
              </div>
              <div className="flex gap-3">
                {stageControls.secondary && (
                  <Button
                    variant="outline"
                    onClick={stageControls.secondary.action}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <stageControls.secondary.icon className="w-4 h-4 mr-2" /> {stageControls.secondary.label}
                  </Button>
                )}
                {stageControls.primary && (
                  <Button
                    onClick={stageControls.primary.action}
                    className="bg-cyan text-navy-primary hover:bg-cyan/90"
                  >
                    <stageControls.primary.icon className="w-4 h-4 mr-2" /> {stageControls.primary.label}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {overviewStats.map((stat, index) => (
              <Card
                key={index}
                onClick={stat.action}
                className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow cursor-pointer hover:border-cyan/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-mono uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-text-secondary text-sm mt-1">{stat.sublabel}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">QUICK ACTIONS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowTeamsModal(true)}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <Users className="w-6 h-6 text-cyan group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Manage Teams</span>
              </button>
              <button
                onClick={() => setShowSubmissionsModal(true)}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <FileText className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">View Submissions</span>
              </button>
              <button
                onClick={() => setShowJudgesModal(true)}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <UserCog className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Manage Judges</span>
              </button>
              <button
                onClick={handleAutoAssignJudges}
                disabled={currentState !== 'JUDGING_OPEN' && currentState !== 'SUBMISSION_OPEN'}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Auto-Assign Judges</span>
              </button>
              <button
                onClick={() => handleExportCSV('teams')}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <Download className="w-6 h-6 text-cyan group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Export Teams</span>
              </button>
              <button
                onClick={() => handleExportCSV('submissions')}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <Download className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Export Submissions</span>
              </button>
              <button
                onClick={() => handleExportCSV('scores')}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <Download className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Export Scores</span>
              </button>
              <button
                onClick={() => setShowNotificationDialog(true)}
                className="flex flex-col items-center gap-2 p-4 bg-navy-primary/50 rounded-xl hover:bg-navy-primary hover:border-cyan/50 border border-transparent transition-all group"
              >
                <Send className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-text-secondary text-sm text-center">Send Notification</span>
              </button>
            </div>
          </Card>

          {/* Stage Timeline */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-white">EVENT TIMELINE</h2>
            </div>
            <div className="flex items-center justify-between">
              {STATES_ORDER.map((state, index) => {
                const isCompleted = index < currentStateIndex;
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Teams Overview */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">TOP TEAMS</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowTeamsModal(true)} className="text-cyan">
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {teams.slice(0, 5).map((team) => {
                  const submission = submissions.find(s => s.teamId === team.id);
                  const avgScore = submission ? calculateAverageScore(submission.id) : null;

                  return (
                    <div key={team.id} className="flex items-center justify-between bg-navy-primary/50 rounded-xl p-3">
                      <div>
                        <p className="text-white text-sm font-medium">{team.name}</p>
                        <p className="text-text-secondary text-xs">{team.memberIds.length} members</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {avgScore !== null && <span className="text-cyan font-mono text-sm">{avgScore.toFixed(1)}</span>}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          team.isDisqualified ? 'bg-red-500/20 text-red-500' :
                          submission ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {team.isDisqualified ? 'disqualified' : submission ? 'submitted' : 'registered'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {teams.length === 0 && (
                  <p className="text-text-secondary text-sm text-center py-4">No teams yet</p>
                )}
              </div>
            </Card>

            {/* Judging Progress */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-white">JUDGING PROGRESS</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowJudgesModal(true)} className="text-cyan">
                  Manage
                </Button>
              </div>
              <div className="space-y-4">
                {judgeProgress.map((judge, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{judge.judge}</span>
                      <div className="flex gap-3">
                        <span className="text-cyan">{judge.done}</span>
                        <span className="text-text-secondary">{judge.pending}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-navy-primary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan rounded-full transition-all"
                        style={{ width: `${judge.done + judge.pending > 0 ? (judge.done / (judge.done + judge.pending)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                {judgeProgress.length === 0 && (
                  <p className="text-text-secondary text-sm text-center py-4">No judges configured</p>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
              <h2 className="font-display text-lg font-bold text-white mb-4">RECENT ACTIVITY</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 bg-navy-primary/50 rounded-xl p-3">
                    <span className="text-cyan text-xs font-mono whitespace-nowrap">[{activity.time}]</span>
                    <span className="text-text-secondary text-sm">{activity.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Notification Dialog */}
      {showNotificationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 max-w-md w-full">
            <h2 className="font-display text-xl font-bold text-white mb-4">Send Notification</h2>
            <textarea
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              placeholder="Enter your notification message..."
              className="w-full h-32 bg-navy-primary border border-white/10 rounded-xl p-3 text-white resize-none focus:border-cyan outline-none mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNotificationDialog(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={sendNotification}
                disabled={!notificationText.trim()}
                className="flex-1 bg-cyan text-navy-primary hover:bg-cyan/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Teams Modal */}
      {showTeamsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Manage Teams</h2>
              <button onClick={() => setShowTeamsModal(false)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-navy-secondary">
                  <tr className="border-b border-white/10">
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Team</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Members</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Status</th>
                    <th className="text-right text-text-secondary font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const members = getTeamMembers(team.id);
                    const submission = submissions.find(s => s.teamId === team.id);

                    return (
                      <tr key={team.id} className="border-b border-white/5">
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{team.name}</p>
                          <p className="text-text-secondary text-xs font-mono">{team.inviteCode}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white text-sm">{members.length}/{config.maxTeamSize}</p>
                          <p className="text-text-secondary text-xs">{members.map(m => m.name).join(', ')}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            team.isDisqualified ? 'bg-red-500/20 text-red-500' :
                            team.isLocked ? 'bg-blue-500/20 text-blue-500' :
                            submission ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {team.isDisqualified ? 'Disqualified' : team.isLocked ? 'Locked' : submission ? 'Submitted' : 'Registered'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {team.isDisqualified ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReinstateTeam(team.id)}
                              className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                            >
                              <ShieldCheck className="w-4 h-4 mr-1" /> Reinstate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisqualifyTeam(team.id)}
                              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            >
                              <Ban className="w-4 h-4 mr-1" /> Disqualify
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {teams.length === 0 && (
                <p className="text-text-secondary text-center py-8">No teams registered yet</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <Button onClick={() => handleExportCSV('teams')} className="bg-cyan text-navy-primary hover:bg-cyan/90">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Manage Submissions</h2>
              <button onClick={() => setShowSubmissionsModal(false)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-navy-secondary">
                  <tr className="border-b border-white/10">
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Team</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Project</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Avg Score</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Status</th>
                    <th className="text-right text-text-secondary font-medium py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => {
                    const team = teams.find(t => t.id === submission.teamId);
                    const avgScore = calculateAverageScore(submission.id);
                    const scoreCount = getScoresForSubmission(submission.id).length;

                    return (
                      <tr key={submission.id} className="border-b border-white/5">
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{team?.name || 'Unknown'}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white text-sm">{submission.title}</p>
                          <p className="text-text-secondary text-xs">{submission.techStack.slice(0, 3).join(', ')}</p>
                        </td>
                        <td className="py-4 px-4">
                          {avgScore !== null ? (
                            <span className="text-cyan font-mono">{avgScore.toFixed(1)}/100</span>
                          ) : (
                            <span className="text-text-secondary text-sm">No scores</span>
                          )}
                          <p className="text-text-secondary text-xs">{scoreCount} judge{scoreCount !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            submission.isLocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                          }`}>
                            {submission.isLocked ? 'Locked' : 'Editable'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSubmissionLock(submission.id, submission.isLocked)}
                            className={submission.isLocked ? 'border-green-500/30 text-green-500 hover:bg-green-500/10' : 'border-red-500/30 text-red-500 hover:bg-red-500/10'}
                          >
                            {submission.isLocked ? <Lock className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                            {submission.isLocked ? 'Unlock' : 'Lock'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {submissions.length === 0 && (
                <p className="text-text-secondary text-center py-8">No submissions yet</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <Button onClick={() => handleExportCSV('submissions')} className="bg-cyan text-navy-primary hover:bg-cyan/90">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Judges Modal */}
      {showJudgesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-white">Manage Judges</h2>
              <button onClick={() => setShowJudgesModal(false)} className="text-text-secondary hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-navy-secondary">
                  <tr className="border-b border-white/10">
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Judge</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Email</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Completed</th>
                    <th className="text-left text-text-secondary font-medium py-3 px-4">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {judges.map((judge) => {
                    const judgeScores = scores.filter(s => s.judgeId === judge.id);
                    const pendingCount = submittedTeams - judgeScores.length;

                    return (
                      <tr key={judge.id} className="border-b border-white/5">
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{judge.name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-text-secondary text-sm">{judge.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-cyan font-mono">{judgeScores.length}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-yellow-500 font-mono">{pendingCount > 0 ? pendingCount : 0}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {judges.length === 0 && (
                <p className="text-text-secondary text-center py-8">No judges configured</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
              <Button
                onClick={handleAutoAssignJudges}
                disabled={currentState !== 'JUDGING_OPEN' && currentState !== 'SUBMISSION_OPEN'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Auto-Assign All
              </Button>
              <Button onClick={() => handleExportCSV('scores')} className="bg-cyan text-navy-primary hover:bg-cyan/90">
                <Download className="w-4 h-4 mr-2" /> Export Scores CSV
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
