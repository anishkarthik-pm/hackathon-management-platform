import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Github, Video, FileArchive, Flag, ArrowRight, ChevronLeft, Save, CheckCircle, ExternalLink, Eye, RotateCcw, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useHackathonData, useCanScore } from '@/context/HackathonDataContext';

const ScoringInterfacePage = () => {
  const navigate = useNavigate();
  const { teamId: submissionId } = useParams<{ teamId: string }>();
  const {
    currentState,
    currentUser,
    loginUser,
    getSubmissionById,
    getTeamById,
    getScoreByJudgeAndSubmission,
    getScoresForSubmission,
    submitScore,
    updateScore,
    calculateTotalScore,
    isJudgeAssignedToSubmission,
    getJudges,
    getAllSubmissions,
  } = useHackathonData();

  const [scores, setScores] = useState({
    innovation: 5,
    execution: 5,
    presentation: 5,
    impact: 5,
    codeQuality: 5
  });
  const [comments, setComments] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-login as judge for demo
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'judge') {
      const result = loginUser('drsharma@glhackathon.com');
      if (!result.success) {
        toast.error('Please login as a judge');
        navigate('/judge-login');
      }
    }
  }, [currentUser, loginUser, navigate]);

  // Get submission and related data
  const submission = submissionId ? getSubmissionById(submissionId) : null;
  const team = submission ? getTeamById(submission.teamId) : null;
  const existingScore = currentUser && submissionId
    ? getScoreByJudgeAndSubmission(currentUser.id, submissionId)
    : null;
  const allScoresForSubmission = submissionId ? getScoresForSubmission(submissionId) : [];

  // Check if can score - the hook validates assignments
  useCanScore(submissionId || '');

  // Check if judge is assigned
  const isAssigned = currentUser && submissionId
    ? isJudgeAssignedToSubmission(currentUser.id, submissionId)
    : false;

  // Load existing score if available
  useEffect(() => {
    if (existingScore) {
      setScores({
        innovation: existingScore.innovation,
        execution: existingScore.execution,
        presentation: existingScore.presentation,
        impact: existingScore.impact,
        codeQuality: existingScore.codeQuality,
      });
      setComments(existingScore.comments);
      setFlagged(existingScore.flagged);
    }
  }, [existingScore]);

  // Get all submissions for navigation
  const allSubmissions = getAllSubmissions();
  const currentIndex = allSubmissions.findIndex(s => s.id === submissionId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allSubmissions.length - 1;

  const criteria = [
    { key: 'innovation', label: 'Innovation', description: 'Uniqueness of idea and creative approach', weight: 25 },
    { key: 'execution', label: 'Execution', description: 'Technical implementation and functionality', weight: 25 },
    { key: 'presentation', label: 'Presentation', description: 'Demo quality and documentation', weight: 20 },
    { key: 'impact', label: 'Impact', description: 'Real-world applicability and usefulness', weight: 20 },
    { key: 'codeQuality', label: 'Code Quality', description: 'Clean, documented, maintainable code', weight: 10 },
  ];

  const calculateTotal = () => {
    return criteria.reduce((total, c) => {
      return total + (scores[c.key as keyof typeof scores] * c.weight / 10);
    }, 0);
  };

  const handleSave = async () => {
    // Validate
    if (!isAssigned) {
      toast.error('You are not assigned to score this submission');
      return;
    }

    if (currentState !== 'JUDGING_OPEN') {
      toast.error('Scoring is not currently open');
      return;
    }

    setIsSubmitting(true);

    if (existingScore) {
      // Update existing score
      const result = updateScore(existingScore.id, {
        innovation: scores.innovation,
        execution: scores.execution,
        presentation: scores.presentation,
        impact: scores.impact,
        codeQuality: scores.codeQuality,
        comments,
        flagged,
      });

      if (result.success) {
        toast.success('Score updated successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(result.error);
      }
    } else {
      // Create new score
      const result = submitScore(submissionId!, {
        innovation: scores.innovation,
        execution: scores.execution,
        presentation: scores.presentation,
        impact: scores.impact,
        codeQuality: scores.codeQuality,
        comments,
        flagged,
      });

      if (result.success) {
        toast.success('Score submitted successfully');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(result.error);
      }
    }

    setIsSubmitting(false);
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      navigate(`/judge/score/${allSubmissions[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      navigate(`/judge/score/${allSubmissions[currentIndex + 1].id}`);
    } else {
      toast.info('You have reviewed all submissions!');
      navigate('/judge');
    }
  };

  const resetScores = () => {
    setScores({
      innovation: 5,
      execution: 5,
      presentation: 5,
      impact: 5,
      codeQuality: 5
    });
    setComments('');
    setFlagged(false);
    toast.info('Scores reset to default');
  };

  const handleSubmitAndNext = async () => {
    await handleSave();
    if (hasNext) {
      handleNext();
    }
  };

  // Get other judges' scores
  const judges = getJudges();
  const otherJudgeScores = allScoresForSubmission
    .filter(s => s.judgeId !== currentUser?.id)
    .map(score => {
      const judge = judges.find(j => j.id === score.judgeId);
      return {
        name: judge?.name || 'Unknown',
        score: calculateTotalScore(score),
      };
    });

  if (!submission || !team) {
    return (
      <div className="min-h-screen bg-navy-primary noise-overlay flex items-center justify-center">
        <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">Submission Not Found</h2>
          <p className="text-text-secondary mb-4">The submission you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/judge')} className="bg-cyan text-navy-primary">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Check if scoring is blocked
  const isBlocked = currentState !== 'JUDGING_OPEN' || !isAssigned;

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-white/5">
        <button
          onClick={() => navigate('/judge')}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </button>
        <div className="font-display text-xl font-bold text-cyan tracking-wider">Judge Portal</div>
        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-sm">
            Submission {currentIndex + 1} of {allSubmissions.length}
          </span>
          <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm">Logout</button>
        </div>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Assignment/State Warning */}
          {isBlocked && (
            <Card className="bg-red-500/20 border-red-500/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-red-500 font-medium">
                    {!isAssigned ? 'Not Assigned' : 'Scoring Closed'}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {!isAssigned
                      ? 'You are not assigned to score this submission. Contact the admin.'
                      : 'Scoring is only allowed during the Judging phase.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Review Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-text-secondary text-sm font-mono uppercase tracking-wider mb-2">
                REVIEWING: Team {team.name}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                {submission.title}
              </h1>
              <div className="flex gap-2 mt-2">
                {submission.techStack.map((tech, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-cyan/10 text-cyan text-xs rounded-full">{tech}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isBlocked || isSubmitting}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-1" /> {saved ? 'Saved!' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetScores}
                disabled={isBlocked}
                className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Submission Files */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <h2 className="font-display text-lg font-bold text-white mb-4">SUBMISSION FILES</h2>

                <div className="space-y-4">
                  <div className="bg-navy-primary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileArchive className="w-5 h-5 text-cyan" />
                      <span className="text-white text-sm">{submission.fileName}</span>
                    </div>
                    <p className="text-text-secondary text-xs mb-3">{submission.fileSize}</p>
                    <Button size="sm" variant="outline" className="border-cyan/50 text-cyan hover:bg-cyan/10">
                      <Download className="w-4 h-4 mr-2" /> Download ZIP
                    </Button>
                  </div>

                  <div className="bg-navy-primary rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Github className="w-5 h-5 text-cyan" />
                      <span className="text-white text-sm">GitHub Repository</span>
                    </div>
                    <a
                      href={submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan text-sm hover:underline truncate block flex items-center gap-1"
                    >
                      {submission.githubUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {submission.demoUrl && (
                    <div className="bg-navy-primary rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Video className="w-5 h-5 text-cyan" />
                        <span className="text-white text-sm">Demo Video</span>
                      </div>
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan text-sm hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Watch Demo
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <h2 className="font-display text-lg font-bold text-white mb-4">DESCRIPTION</h2>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {submission.description}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-text-secondary text-sm mb-2">Problem Statement</p>
                  <span className="px-3 py-1 bg-navy-primary rounded-lg text-cyan text-xs">
                    {submission.problemStatement}
                  </span>
                </div>
              </Card>

              {/* Other Judges' Scores */}
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <h2 className="font-display text-lg font-bold text-white mb-4">OTHER JUDGES</h2>
                <div className="space-y-2">
                  {otherJudgeScores.length > 0 ? (
                    otherJudgeScores.map((judge, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-text-secondary text-sm">{judge.name}</span>
                        <span className="text-cyan font-mono">{judge.score.toFixed(1)}/100</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No other scores yet</p>
                  )}
                  {existingScore && (
                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <span className="text-white text-sm font-medium">You</span>
                      <span className="text-cyan font-mono">{calculateTotalScore(existingScore).toFixed(1)}/100</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Panel - Scoring Rubric */}
            <div className="lg:col-span-3">
              <Card className="bg-navy-secondary border-white/10 rounded-3xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-lg font-bold text-white">SCORING RUBRIC</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-cyan">
                        <Eye className="w-4 h-4 mr-1" /> Rubric Guide
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-navy-secondary border-white/10 max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-white">Scoring Guidelines</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-text-secondary text-sm">
                        <p><strong className="text-white">1-3:</strong> Poor - Does not meet expectations</p>
                        <p><strong className="text-white">4-5:</strong> Fair - Meets minimum requirements</p>
                        <p><strong className="text-white">6-7:</strong> Good - Solid implementation</p>
                        <p><strong className="text-white">8-9:</strong> Excellent - Exceeds expectations</p>
                        <p><strong className="text-white">10:</strong> Outstanding - Exceptional work</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-6">
                  {criteria.map((criterion) => (
                    <div key={criterion.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white font-medium">{criterion.label} (1-10)*</Label>
                          <p className="text-text-secondary text-xs">{criterion.description} • Weight: {criterion.weight}%</p>
                        </div>
                        <span className="text-cyan font-mono font-bold text-lg">
                          {scores[criterion.key as keyof typeof scores]}
                        </span>
                      </div>
                      <Slider
                        value={[scores[criterion.key as keyof typeof scores]]}
                        onValueChange={([value]) => setScores({...scores, [criterion.key]: value})}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                        disabled={isBlocked}
                      />
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>1 (Poor)</span>
                        <span>5 (Fair)</span>
                        <span>10 (Excellent)</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Score */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-white font-bold text-lg">TOTAL SCORE</span>
                      <p className="text-text-secondary text-xs">Weighted average of all criteria</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-4xl font-bold text-cyan">
                        {calculateTotal().toFixed(1)}
                      </span>
                      <span className="text-text-secondary text-lg">/100</span>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-2 mt-6">
                  <Label className="text-white">Feedback Comments (Optional)</Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[120px] bg-navy-primary border-white/10 text-white focus:border-cyan resize-none"
                    placeholder="Provide constructive feedback for the team..."
                    disabled={isBlocked}
                  />
                  <p className="text-text-secondary text-xs">{comments.length} characters</p>
                </div>

                {/* Flag */}
                <button
                  onClick={() => !isBlocked && setFlagged(!flagged)}
                  disabled={isBlocked}
                  className={`flex items-center gap-2 mt-4 text-sm transition-colors ${
                    flagged ? 'text-red-500' : 'text-text-secondary hover:text-red-400'
                  } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Flag className="w-4 h-4" /> {flagged ? 'Flagged for Review - Click to unflag' : 'Flag for Review'}
                </button>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Previous
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isBlocked || isSubmitting}
                className="border-cyan/50 text-cyan hover:bg-cyan/10 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button
                onClick={handleSubmitAndNext}
                disabled={isBlocked || isSubmitting}
                className="bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : existingScore ? 'UPDATE & NEXT' : 'SUBMIT & NEXT'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringInterfacePage;
