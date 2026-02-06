import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, Award, Users, Lock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useHackathonData, type HackathonState } from '@/context/HackathonDataContext';

const STATE_LABELS: Record<HackathonState, string> = {
  'DRAFT': 'Draft',
  'REGISTRATION_OPEN': 'Registration Open',
  'SUBMISSION_OPEN': 'Submissions Open',
  'JUDGING_OPEN': 'Judging Open',
  'RESULTS_PUBLISHED': 'Results Published',
};

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { currentState, getLeaderboard } = useHackathonData();

  // Get leaderboard data
  const leaderboard = getLeaderboard();

  // Check if results should be shown
  const showResults = currentState === 'RESULTS_PUBLISHED';
  const showScores = currentState === 'JUDGING_OPEN' || currentState === 'RESULTS_PUBLISHED';

  // Get top 3 for podium
  const top3 = leaderboard.slice(0, 3);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-text-secondary';
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return Trophy;
      case 2: return Medal;
      case 3: return Award;
      default: return null;
    }
  };

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
        <div className="px-3 py-1 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-sm font-medium">
          {STATE_LABELS[currentState]}
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              {showResults ? '🏆 FINAL RESULTS' : 'LEADERBOARD'}
            </h1>
            <p className="text-text-secondary">
              {showResults
                ? 'Congratulations to all winners!'
                : showScores
                  ? 'Live scoring results (judging in progress)'
                  : 'Results will be displayed once judging begins'}
            </p>
          </div>

          {/* Show lock message if results not available */}
          {!showScores && (
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-12 text-center mb-8">
              <Lock className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-white mb-2">
                Results Not Yet Available
              </h2>
              <p className="text-text-secondary mb-4">
                The leaderboard will be visible once judging begins.
              </p>
              <p className="text-text-secondary text-sm">
                Current stage: {STATE_LABELS[currentState]}
              </p>
            </Card>
          )}

          {/* Podium - Only show when results available */}
          {showScores && top3.length > 0 && (
            <div className="flex justify-center items-end gap-4 mb-12">
              {/* Second Place */}
              {top3[1] && (
                <div className="text-center">
                  <Card className="bg-navy-secondary border-gray-400/30 rounded-3xl p-6 card-shadow w-48">
                    <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mx-auto mb-4">
                      <Medal className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-400 mb-1">2nd</p>
                    <h3 className="font-display text-lg font-bold text-white mb-1">{top3[1].team.name}</h3>
                    <p className="text-text-secondary text-sm mb-2 truncate">{top3[1].submission.title}</p>
                    <p className="text-2xl font-mono font-bold text-white">
                      {top3[1].averageScore.toFixed(1)}
                    </p>
                  </Card>
                </div>
              )}

              {/* First Place */}
              {top3[0] && (
                <div className="text-center -mt-8">
                  <Card className="bg-navy-secondary border-yellow-500/30 rounded-3xl p-8 card-shadow w-56 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-navy-primary" />
                      </div>
                    </div>
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 mt-4">
                      <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-yellow-500 mb-1">1st</p>
                    <h3 className="font-display text-xl font-bold text-white mb-1">{top3[0].team.name}</h3>
                    <p className="text-text-secondary text-sm mb-2 truncate">{top3[0].submission.title}</p>
                    <p className="text-3xl font-mono font-bold text-cyan">
                      {top3[0].averageScore.toFixed(1)}
                    </p>
                  </Card>
                </div>
              )}

              {/* Third Place */}
              {top3[2] && (
                <div className="text-center">
                  <Card className="bg-navy-secondary border-amber-600/30 rounded-3xl p-6 card-shadow w-48">
                    <div className="w-16 h-16 rounded-full bg-amber-600/20 flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-amber-600 mb-1">3rd</p>
                    <h3 className="font-display text-lg font-bold text-white mb-1">{top3[2].team.name}</h3>
                    <p className="text-text-secondary text-sm mb-2 truncate">{top3[2].submission.title}</p>
                    <p className="text-2xl font-mono font-bold text-white">
                      {top3[2].averageScore.toFixed(1)}
                    </p>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          {showScores && leaderboard.length > 0 && (
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow mb-8">
              <h2 className="font-display text-lg font-bold text-white mb-6">FULL LEADERBOARD</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-text-secondary font-medium py-3 px-4">Rank</th>
                      <th className="text-left text-text-secondary font-medium py-3 px-4">Team</th>
                      <th className="text-left text-text-secondary font-medium py-3 px-4">Project</th>
                      <th className="text-center text-text-secondary font-medium py-3 px-4">Judges</th>
                      <th className="text-right text-text-secondary font-medium py-3 px-4">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry) => {
                      const MedalIcon = getMedalIcon(entry.rank);
                      const isTopThree = entry.rank <= 3;

                      return (
                        <tr
                          key={entry.team.id}
                          className={`border-b border-white/5 ${isTopThree ? 'bg-navy-primary/30' : ''}`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {MedalIcon && (
                                <MedalIcon className={`w-5 h-5 ${getMedalColor(entry.rank)}`} />
                              )}
                              <span className={`font-bold ${isTopThree ? getMedalColor(entry.rank) : 'text-white'}`}>
                                #{entry.rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-cyan" />
                              </div>
                              <span className="text-white font-medium">{entry.team.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-text-secondary text-sm">{entry.submission.title}</p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-text-secondary">{entry.scoreCount}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-mono font-bold ${isTopThree ? 'text-cyan text-lg' : 'text-white'}`}>
                              {entry.averageScore.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-secondary">No submissions have been scored yet.</p>
                </div>
              )}
            </Card>
          )}

          {/* No submissions message */}
          {showScores && leaderboard.length === 0 && (
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-12 text-center">
              <Users className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-white mb-2">
                No Scored Submissions Yet
              </h2>
              <p className="text-text-secondary">
                Scores will appear here once judges begin evaluating submissions.
              </p>
            </Card>
          )}

          {/* Footer Message for Results */}
          {showResults && leaderboard.length > 0 && (
            <Card className="bg-navy-secondary border-cyan/30 rounded-3xl p-6 card-shadow text-center">
              <p className="text-white mb-2">🎉 Congratulations to all participants!</p>
              <p className="text-text-secondary text-sm mb-4">
                Winners will be contacted via email for prize details.
              </p>
              <Button variant="outline" className="border-cyan/50 text-cyan hover:bg-cyan/10">
                <Download className="w-4 h-4 mr-2" /> Download Certificate
              </Button>
            </Card>
          )}

          {/* Back button */}
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
