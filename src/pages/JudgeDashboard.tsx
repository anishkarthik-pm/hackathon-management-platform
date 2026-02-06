import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Clock3, FileText, BarChart3, Filter, Eye, Edit2, LogOut, Search, Star, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATES_ORDER: HackathonState[] = ['DRAFT', 'REGISTRATION_OPEN', 'SUBMISSION_OPEN', 'JUDGING_OPEN', 'RESULTS_PUBLISHED'];

const JudgeDashboard = () => {
  const navigate = useNavigate();
  const {
    currentState,
    currentUser,
    loginUser,
    getAllSubmissions,
    getJudges,
    getScoreByJudgeAndSubmission,
    getScoresByJudge,
    isJudgeAssignedToSubmission,
    calculateTotalScore,
    getAllTeams,
  } = useHackathonData();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-login as judge for demo
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'judge') {
      // Login as first judge for demo
      const result = loginUser('drsharma@glhackathon.com');
      if (!result.success) {
        toast.error('Please login as a judge');
        navigate('/judge-login');
      }
    }
  }, [currentUser, loginUser, navigate]);

  const judgeId = currentUser?.id || '';
  const judgeName = currentUser?.name || 'Judge';

  // Get data
  const allSubmissions = getAllSubmissions();
  const teams = getAllTeams();
  const judges = getJudges();

  // Get judge's scores
  const judgeScores = getScoresByJudge(judgeId);

  // Filter submissions to only assigned ones
  const assignedSubmissions = allSubmissions.filter(sub =>
    isJudgeAssignedToSubmission(judgeId, sub.id)
  );

  // Calculate stats
  const assignedCount = assignedSubmissions.length;
  const completedCount = assignedSubmissions.filter(sub =>
    getScoreByJudgeAndSubmission(judgeId, sub.id)
  ).length;
  const pendingCount = assignedCount - completedCount;

  const stats = [
    { label: 'ASSIGNED', value: assignedCount, sublabel: 'Submissions', icon: FileText, color: 'cyan' },
    { label: 'COMPLETED', value: completedCount, sublabel: 'Scored', icon: CheckCircle, color: 'green' },
    { label: 'PENDING', value: pendingCount, sublabel: 'Remaining', icon: Clock3, color: 'yellow' },
  ];

  // Build submissions list with scoring status
  const submissions = assignedSubmissions.map(sub => {
    const team = teams.find(t => t.id === sub.teamId);
    const score = getScoreByJudgeAndSubmission(judgeId, sub.id);

    return {
      id: sub.id,
      team: team?.name || 'Unknown',
      project: sub.title,
      status: score ? 'scored' : 'pending',
      score: score ? calculateTotalScore(score) : null,
      submittedAt: new Date(sub.submittedAt).toLocaleString(),
    };
  });

  // Filter and sort submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === 'pending') return sub.status === 'pending';
    if (filterStatus === 'scored') return sub.status === 'scored';
    return true;
  }).filter(sub =>
    sub.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.project.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    // Sort by score descending if available
    if (a.score !== null && b.score !== null) {
      return b.score - a.score;
    }
    return 0;
  });

  // Calculate judge progress for all judges
  const judgeProgress = judges.map(judge => {
    const judgeSubmissions = allSubmissions.filter(sub =>
      isJudgeAssignedToSubmission(judge.id, sub.id)
    );
    const judgeCompleted = judgeSubmissions.filter(sub =>
      getScoreByJudgeAndSubmission(judge.id, sub.id)
    ).length;

    return {
      judge: judge.name,
      done: judgeCompleted,
      pending: judgeSubmissions.length - judgeCompleted,
    };
  });

  // Recent activity (based on recent scores)
  const recentActivity = judgeScores.slice(0, 3).map(score => {
    const submission = allSubmissions.find(s => s.id === score.submissionId);
    const team = submission ? teams.find(t => t.id === submission.teamId) : null;
    return {
      action: 'Scored',
      target: team?.name || 'Unknown',
      score: calculateTotalScore(score),
      time: new Date(score.submittedAt).toLocaleString(),
    };
  });

  // Get stage message for judges
  const getStageMessage = () => {
    switch (currentState) {
      case 'DRAFT':
      case 'REGISTRATION_OPEN':
        return { text: 'Hackathon has not started yet. No submissions to review.', type: 'info', icon: Clock };
      case 'SUBMISSION_OPEN':
        return { text: 'Hackathon is live! Teams are submitting projects.', type: 'success', icon: CheckCircle };
      case 'JUDGING_OPEN':
        return { text: 'Judging in progress. Please complete your assigned reviews.', type: 'warning', icon: AlertTriangle };
      case 'RESULTS_PUBLISHED':
        return { text: 'Judging complete. Results have been published.', type: 'success', icon: CheckCircle };
      default:
        return null;
    }
  };

  const stageMessage = getStageMessage();
  const currentStateIndex = STATES_ORDER.indexOf(currentState);

  // Check if scoring is allowed
  const canScore = currentState === 'JUDGING_OPEN';

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="font-display text-xl font-bold text-cyan tracking-wider cursor-pointer" onClick={() => navigate('/')}>GL</div>
          <span className="text-text-secondary hidden sm:inline">Judge Portal - GL Hackathon</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 text-sm font-medium">
            {STATE_LABELS[currentState]}
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-purple-500" />
          </div>
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stage Message Banner */}
          {stageMessage && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              stageMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30' :
              stageMessage.type === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/30' :
              'bg-cyan/20 border border-cyan/30'
            }`}>
              <stageMessage.icon className={`w-5 h-5 ${
                stageMessage.type === 'success' ? 'text-green-500' :
                stageMessage.type === 'warning' ? 'text-yellow-500' :
                'text-cyan'
              }`} />
              <p className={`text-sm font-medium ${
                stageMessage.type === 'success' ? 'text-green-500' :
                stageMessage.type === 'warning' ? 'text-yellow-500' :
                'text-cyan'
              }`}>
                {stageMessage.text}
              </p>
            </div>
          )}

          {/* Welcome */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                Welcome, {judgeName}!
              </h1>
              <p className="text-text-secondary">Judge Portal - GL Hackathon 2026</p>
            </div>
          </div>

          {/* Hackathon Stage Progress */}
          <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
            <h2 className="font-display text-lg font-bold text-white mb-4">HACKATHON STAGE</h2>
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

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow hover:border-cyan/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-text-secondary text-sm font-mono uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="font-display text-4xl font-bold text-white">{stat.value}</p>
                    <p className="text-text-secondary text-sm mt-1">{stat.sublabel}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Submissions to Review */}
            <div className="lg:col-span-2">
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2 className="font-display text-lg font-bold text-white">SUBMISSIONS TO REVIEW</h2>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <Input
                        placeholder="Search teams..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-navy-primary border-white/10 text-white text-sm w-40"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32 h-9 bg-navy-primary border-white/10 text-white text-sm">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-navy-secondary border-white/10">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="scored">Scored</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show message if hackathon hasn't started or no assignments */}
                {(currentState === 'DRAFT' || currentState === 'REGISTRATION_OPEN') && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-navy-primary flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-text-secondary" />
                    </div>
                    <p className="text-text-secondary">Submissions will appear here once the hackathon begins</p>
                  </div>
                )}

                {/* Show no assignments message */}
                {currentState !== 'DRAFT' && currentState !== 'REGISTRATION_OPEN' && assignedSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-navy-primary flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-text-secondary" />
                    </div>
                    <p className="text-text-secondary">No submissions have been assigned to you yet</p>
                    <p className="text-text-secondary text-sm mt-2">The admin will assign submissions for you to review</p>
                  </div>
                )}

                {/* Show submissions if available */}
                {assignedSubmissions.length > 0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-text-secondary font-medium py-3 px-4">#</th>
                            <th className="text-left text-text-secondary font-medium py-3 px-4">Team</th>
                            <th className="text-left text-text-secondary font-medium py-3 px-4">Project</th>
                            <th className="text-left text-text-secondary font-medium py-3 px-4">Status</th>
                            <th className="text-right text-text-secondary font-medium py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubmissions.map((sub, index) => (
                            <tr key={sub.id} className="border-b border-white/5 hover:bg-navy-primary/50 transition-colors">
                              <td className="py-4 px-4 text-text-secondary">{index + 1}</td>
                              <td className="py-4 px-4 text-white font-medium">{sub.team}</td>
                              <td className="py-4 px-4 text-text-secondary">{sub.project}</td>
                              <td className="py-4 px-4">
                                {sub.status === 'scored' ? (
                                  <span className="flex items-center gap-1 text-green-500 text-sm">
                                    <CheckCircle className="w-4 h-4" /> {sub.score?.toFixed(1)}/100
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-yellow-500 text-sm">
                                    <Clock3 className="w-4 h-4" /> Pending
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/judge/score/${sub.id}`)}
                                  disabled={!canScore && sub.status === 'pending'}
                                  className={sub.status === 'scored'
                                    ? 'bg-navy-primary text-cyan hover:bg-navy-primary/80 border border-cyan/30'
                                    : 'bg-cyan text-navy-primary hover:bg-cyan/90 disabled:opacity-50'}
                                >
                                  {sub.status === 'scored' ? <Edit2 className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                                  {sub.status === 'scored' ? 'Edit' : 'Review'}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filteredSubmissions.length === 0 && (
                      <div className="text-center py-8 text-text-secondary">
                        No submissions found matching your criteria.
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Scoring Stats */}
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-cyan" />
                  <h2 className="font-display text-lg font-bold text-white">YOUR SCORING STATS</h2>
                </div>
                {judgeScores.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-navy-primary/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-white">
                        {(judgeScores.reduce((acc, s) => acc + calculateTotalScore(s), 0) / judgeScores.length).toFixed(1)}
                      </p>
                      <p className="text-text-secondary text-xs">Avg Score</p>
                    </div>
                    <div className="bg-navy-primary/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-cyan">
                        {Math.max(...judgeScores.map(s => calculateTotalScore(s))).toFixed(0)}
                      </p>
                      <p className="text-text-secondary text-xs">Highest</p>
                    </div>
                    <div className="bg-navy-primary/50 rounded-xl p-3">
                      <p className="text-2xl font-bold text-text-secondary">
                        {Math.min(...judgeScores.map(s => calculateTotalScore(s))).toFixed(0)}
                      </p>
                      <p className="text-text-secondary text-xs">Lowest</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm text-center py-4">No scores yet</p>
                )}
              </Card>

              {/* Judging Progress */}
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <h2 className="font-display text-lg font-bold text-white mb-4">JUDGING PROGRESS</h2>
                <div className="space-y-4">
                  {judgeProgress.map((judge, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={`${judge.judge === judgeName ? 'text-cyan font-medium' : 'text-white'}`}>
                          {judge.judge} {judge.judge === judgeName && '(You)'}
                        </span>
                        <div className="flex gap-3">
                          <span className="text-cyan">{judge.done}</span>
                          <span className="text-text-secondary">{judge.pending}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-navy-primary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${judge.judge === judgeName ? 'bg-cyan' : 'bg-white/30'}`}
                          style={{ width: `${(judge.done + judge.pending) > 0 ? (judge.done / (judge.done + judge.pending)) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <h2 className="font-display text-lg font-bold text-white mb-4">RECENT ACTIVITY</h2>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 bg-navy-primary/50 rounded-xl p-3">
                        <span className="text-cyan text-xs font-mono whitespace-nowrap">{activity.time.split(',')[1]}</span>
                        <div>
                          <span className="text-white text-sm">{activity.action} </span>
                          <span className="text-cyan text-sm">{activity.target}</span>
                          {activity.score && <span className="text-green-500 text-sm"> - {activity.score.toFixed(1)}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm text-center py-4">No recent activity</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
