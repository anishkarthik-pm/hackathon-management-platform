/**
 * Hackathon Data Context
 *
 * Provides React components access to the centralized store.
 * Wraps store methods with state updates to trigger re-renders.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import {
  hackathonStore,
  type HackathonState,
  type HackathonConfig,
  type User,
  type Team,
  type Submission,
  type JudgeAssignment,
  type Score,
  type Result,
} from '../store/hackathonStore';

// Re-export types for convenience
export type {
  HackathonState,
  HackathonConfig,
  User,
  Team,
  Submission,
  JudgeAssignment,
  Score,
  Result,
};

interface HackathonDataContextType {
  // Config & State
  config: HackathonConfig;
  currentState: HackathonState;
  transitionState: (newState: HackathonState) => Result<HackathonState>;

  // Current User
  currentUser: User | null;
  loginUser: (email: string) => Result<User>;
  logoutUser: () => void;
  registerUser: (data: Omit<User, 'id' | 'teamId' | 'createdAt'>) => Result<User>;

  // Users
  getAllUsers: () => User[];
  getParticipants: () => User[];
  getJudges: () => User[];
  getUserById: (userId: string) => User | null;

  // Teams
  getAllTeams: () => Team[];
  getTeamById: (teamId: string) => Team | null;
  getTeamByInviteCode: (code: string) => Team | null;
  getTeamMembers: (teamId: string) => User[];
  createTeam: (name: string) => Result<Team>;
  joinTeam: (inviteCode: string) => Result<Team>;
  leaveTeam: () => Result<void>;
  disqualifyTeam: (teamId: string) => Result<Team>;
  reinstateTeam: (teamId: string) => Result<Team>;

  // Submissions
  getAllSubmissions: () => Submission[];
  getSubmissionById: (submissionId: string) => Submission | null;
  getSubmissionByTeam: (teamId: string) => Submission | null;
  createOrUpdateSubmission: (data: Omit<Submission, 'id' | 'teamId' | 'submittedAt' | 'lastEditedAt' | 'isLocked'>) => Result<Submission>;
  lockSubmission: (submissionId: string) => Result<Submission>;
  unlockSubmission: (submissionId: string) => Result<Submission>;

  // Judge Assignments
  getJudgeAssignments: (judgeId: string) => JudgeAssignment[];
  getSubmissionAssignments: (submissionId: string) => JudgeAssignment[];
  isJudgeAssignedToSubmission: (judgeId: string, submissionId: string) => boolean;
  assignJudgeToSubmission: (judgeId: string, submissionId: string) => Result<JudgeAssignment>;
  removeJudgeAssignment: (judgeId: string, submissionId: string) => Result<void>;
  autoAssignJudges: () => Result<number>;

  // Scoring
  getAllScores: () => Score[];
  getScoresForSubmission: (submissionId: string) => Score[];
  getScoresByJudge: (judgeId: string) => Score[];
  getScoreByJudgeAndSubmission: (judgeId: string, submissionId: string) => Score | null;
  submitScore: (submissionId: string, scores: {
    innovation: number;
    execution: number;
    presentation: number;
    impact: number;
    codeQuality: number;
    comments: string;
    flagged: boolean;
  }) => Result<Score>;
  updateScore: (scoreId: string, updates: Partial<{
    innovation: number;
    execution: number;
    presentation: number;
    impact: number;
    codeQuality: number;
    comments: string;
    flagged: boolean;
  }>) => Result<Score>;
  calculateTotalScore: (score: Score) => number;
  calculateAverageScore: (submissionId: string) => number | null;

  // Leaderboard
  getLeaderboard: () => Array<{
    rank: number;
    team: Team;
    submission: Submission;
    averageScore: number;
    scoreCount: number;
  }>;

  // CSV Export
  exportTeamsCSV: () => string;
  exportSubmissionsCSV: () => string;
  exportScoresCSV: () => string;

  // Reset
  resetAllData: () => void;

  // Refresh trigger
  refresh: () => void;
}

const HackathonDataContext = createContext<HackathonDataContextType | undefined>(undefined);

export function HackathonDataProvider({ children }: { children: ReactNode }) {
  // Version counter to force re-renders
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  // Load initial state
  const [config, setConfig] = useState(hackathonStore.getConfig());
  const [currentUser, setCurrentUser] = useState(hackathonStore.getCurrentUser());

  // Sync state from store
  useEffect(() => {
    setConfig(hackathonStore.getConfig());
    setCurrentUser(hackathonStore.getCurrentUser());
  }, [version]);

  // State transition
  const transitionState = useCallback((newState: HackathonState) => {
    const adminId = currentUser?.role === 'admin' ? currentUser.id : 'unknown';
    const result = hackathonStore.transitionState(newState, adminId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  // User methods
  const loginUser = useCallback((email: string) => {
    const result = hackathonStore.loginUser(email);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const logoutUser = useCallback(() => {
    hackathonStore.logoutUser();
    refresh();
  }, [refresh]);

  const registerUser = useCallback((data: Omit<User, 'id' | 'teamId' | 'createdAt'>) => {
    const result = hackathonStore.registerUser(data);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  // Team methods
  const createTeam = useCallback((name: string) => {
    if (!currentUser) {
      return { success: false, error: 'Not logged in' } as Result<Team>;
    }
    const result = hackathonStore.createTeam(name, currentUser.id);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  const joinTeam = useCallback((inviteCode: string) => {
    if (!currentUser) {
      return { success: false, error: 'Not logged in' } as Result<Team>;
    }
    const result = hackathonStore.joinTeam(inviteCode, currentUser.id);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  const leaveTeam = useCallback(() => {
    if (!currentUser) {
      return { success: false, error: 'Not logged in' } as Result<void>;
    }
    const result = hackathonStore.leaveTeam(currentUser.id);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  const disqualifyTeam = useCallback((teamId: string) => {
    const result = hackathonStore.disqualifyTeam(teamId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const reinstateTeam = useCallback((teamId: string) => {
    const result = hackathonStore.reinstateTeam(teamId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  // Submission methods
  const createOrUpdateSubmission = useCallback((data: Omit<Submission, 'id' | 'teamId' | 'submittedAt' | 'lastEditedAt' | 'isLocked'>) => {
    if (!currentUser?.teamId) {
      return { success: false, error: 'Not in a team' } as Result<Submission>;
    }
    const result = hackathonStore.createOrUpdateSubmission(currentUser.teamId, data);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  const lockSubmission = useCallback((submissionId: string) => {
    const result = hackathonStore.lockSubmission(submissionId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const unlockSubmission = useCallback((submissionId: string) => {
    const result = hackathonStore.unlockSubmission(submissionId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  // Judge assignment methods
  const assignJudgeToSubmission = useCallback((judgeId: string, submissionId: string) => {
    const result = hackathonStore.assignJudgeToSubmission(judgeId, submissionId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const removeJudgeAssignment = useCallback((judgeId: string, submissionId: string) => {
    const result = hackathonStore.removeJudgeAssignment(judgeId, submissionId);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const autoAssignJudges = useCallback(() => {
    const result = hackathonStore.autoAssignJudges();
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  // Scoring methods
  const submitScore = useCallback((submissionId: string, scores: {
    innovation: number;
    execution: number;
    presentation: number;
    impact: number;
    codeQuality: number;
    comments: string;
    flagged: boolean;
  }) => {
    if (!currentUser || currentUser.role !== 'judge') {
      return { success: false, error: 'Not authorized to score' } as Result<Score>;
    }
    const result = hackathonStore.submitScore(currentUser.id, submissionId, scores);
    if (result.success) {
      refresh();
    }
    return result;
  }, [currentUser, refresh]);

  const updateScore = useCallback((scoreId: string, updates: Partial<{
    innovation: number;
    execution: number;
    presentation: number;
    impact: number;
    codeQuality: number;
    comments: string;
    flagged: boolean;
  }>) => {
    const result = hackathonStore.updateScore(scoreId, updates);
    if (result.success) {
      refresh();
    }
    return result;
  }, [refresh]);

  const resetAllData = useCallback(() => {
    hackathonStore.resetAllData();
    refresh();
  }, [refresh]);

  const value: HackathonDataContextType = {
    // Config & State
    config,
    currentState: config.currentState,
    transitionState,

    // Current User
    currentUser,
    loginUser,
    logoutUser,
    registerUser,

    // Users
    getAllUsers: hackathonStore.getAllUsers.bind(hackathonStore),
    getParticipants: hackathonStore.getParticipants.bind(hackathonStore),
    getJudges: hackathonStore.getJudges.bind(hackathonStore),
    getUserById: hackathonStore.getUserById.bind(hackathonStore),

    // Teams
    getAllTeams: hackathonStore.getAllTeams.bind(hackathonStore),
    getTeamById: hackathonStore.getTeamById.bind(hackathonStore),
    getTeamByInviteCode: hackathonStore.getTeamByInviteCode.bind(hackathonStore),
    getTeamMembers: hackathonStore.getTeamMembers.bind(hackathonStore),
    createTeam,
    joinTeam,
    leaveTeam,
    disqualifyTeam,
    reinstateTeam,

    // Submissions
    getAllSubmissions: hackathonStore.getAllSubmissions.bind(hackathonStore),
    getSubmissionById: hackathonStore.getSubmissionById.bind(hackathonStore),
    getSubmissionByTeam: hackathonStore.getSubmissionByTeam.bind(hackathonStore),
    createOrUpdateSubmission,
    lockSubmission,
    unlockSubmission,

    // Judge Assignments
    getJudgeAssignments: hackathonStore.getJudgeAssignments.bind(hackathonStore),
    getSubmissionAssignments: hackathonStore.getSubmissionAssignments.bind(hackathonStore),
    isJudgeAssignedToSubmission: hackathonStore.isJudgeAssignedToSubmission.bind(hackathonStore),
    assignJudgeToSubmission,
    removeJudgeAssignment,
    autoAssignJudges,

    // Scoring
    getAllScores: hackathonStore.getAllScores.bind(hackathonStore),
    getScoresForSubmission: hackathonStore.getScoresForSubmission.bind(hackathonStore),
    getScoresByJudge: hackathonStore.getScoresByJudge.bind(hackathonStore),
    getScoreByJudgeAndSubmission: hackathonStore.getScoreByJudgeAndSubmission.bind(hackathonStore),
    submitScore,
    updateScore,
    calculateTotalScore: hackathonStore.calculateTotalScore.bind(hackathonStore),
    calculateAverageScore: hackathonStore.calculateAverageScore.bind(hackathonStore),

    // Leaderboard
    getLeaderboard: hackathonStore.getLeaderboard.bind(hackathonStore),

    // CSV Export
    exportTeamsCSV: hackathonStore.exportTeamsCSV.bind(hackathonStore),
    exportSubmissionsCSV: hackathonStore.exportSubmissionsCSV.bind(hackathonStore),
    exportScoresCSV: hackathonStore.exportScoresCSV.bind(hackathonStore),

    // Reset
    resetAllData,

    // Refresh
    refresh,
  };

  return (
    <HackathonDataContext.Provider value={value}>
      {children}
    </HackathonDataContext.Provider>
  );
}

export function useHackathonData() {
  const context = useContext(HackathonDataContext);
  if (context === undefined) {
    throw new Error('useHackathonData must be used within a HackathonDataProvider');
  }
  return context;
}

// Helper hooks for common use cases
export function useCurrentTeam() {
  const { currentUser, getTeamById, getTeamMembers } = useHackathonData();
  const team = currentUser?.teamId ? getTeamById(currentUser.teamId) : null;
  const members = team ? getTeamMembers(team.id) : [];
  return { team, members };
}

export function useCurrentSubmission() {
  const { currentUser, getSubmissionByTeam } = useHackathonData();
  const submission = currentUser?.teamId ? getSubmissionByTeam(currentUser.teamId) : null;
  return submission;
}

export function useCanSubmit() {
  const { currentState, currentUser } = useHackathonData();
  const { team } = useCurrentTeam();
  const submission = useCurrentSubmission();

  if (currentState !== 'SUBMISSION_OPEN') {
    return { canSubmit: false, reason: 'Submissions are not currently open' };
  }

  if (!currentUser) {
    return { canSubmit: false, reason: 'Not logged in' };
  }

  if (!team) {
    return { canSubmit: false, reason: 'You must be in a team to submit' };
  }

  if (team.isDisqualified) {
    return { canSubmit: false, reason: 'Your team has been disqualified' };
  }

  if (submission?.isLocked) {
    return { canSubmit: false, reason: 'Your submission has been locked' };
  }

  return { canSubmit: true, reason: null };
}

export function useCanScore(submissionId: string) {
  const { currentState, currentUser, isJudgeAssignedToSubmission, getScoreByJudgeAndSubmission } = useHackathonData();

  if (currentState !== 'JUDGING_OPEN') {
    return { canScore: false, reason: 'Scoring is not currently open' };
  }

  if (!currentUser || currentUser.role !== 'judge') {
    return { canScore: false, reason: 'You must be a judge to score' };
  }

  if (!isJudgeAssignedToSubmission(currentUser.id, submissionId)) {
    return { canScore: false, reason: 'You are not assigned to this submission' };
  }

  const existingScore = getScoreByJudgeAndSubmission(currentUser.id, submissionId);
  if (existingScore) {
    return { canScore: false, reason: 'You have already scored this submission', existingScore };
  }

  return { canScore: true, reason: null };
}
