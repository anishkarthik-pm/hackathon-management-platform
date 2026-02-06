/**
 * Centralized Hackathon Data Store
 *
 * MVP Implementation Notes:
 * - Uses localStorage for persistence (no backend)
 * - All validation is synchronous
 * - No real-time sync between tabs (acceptable for MVP)
 * - IDs are simple incremental integers
 */

// ============= TYPES =============

export type HackathonState =
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'SUBMISSION_OPEN'
  | 'JUDGING_OPEN'
  | 'RESULTS_PUBLISHED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  skills: string[];
  role: 'participant' | 'judge' | 'admin';
  teamId: string | null;
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  memberIds: string[];
  submissionId: string | null;
  isLocked: boolean; // Lock after submission
  isDisqualified: boolean;
  createdAt: number;
}

export interface Submission {
  id: string;
  teamId: string;
  title: string;
  problemStatement: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  fileName: string;
  fileSize: string;
  submittedAt: number;
  lastEditedAt: number;
  isLocked: boolean; // Lock after submission window closes
}

export interface JudgeAssignment {
  judgeId: string;
  submissionId: string;
  assignedAt: number;
}

export interface Score {
  id: string;
  judgeId: string;
  submissionId: string;
  innovation: number; // 1-10
  execution: number; // 1-10
  presentation: number; // 1-10
  impact: number; // 1-10
  codeQuality: number; // 1-10
  comments: string;
  flagged: boolean;
  submittedAt: number;
}

export interface HackathonConfig {
  id: string;
  name: string;
  currentState: HackathonState;
  maxTeamSize: number;
  maxTeams: number;
  stateHistory: Array<{
    state: HackathonState;
    changedAt: number;
    changedBy: string;
  }>;
  createdAt: number;
}

// ============= STORAGE KEYS =============

const STORAGE_KEYS = {
  CONFIG: 'hackathon_config',
  USERS: 'hackathon_users',
  TEAMS: 'hackathon_teams',
  SUBMISSIONS: 'hackathon_submissions',
  JUDGE_ASSIGNMENTS: 'hackathon_judge_assignments',
  SCORES: 'hackathon_scores',
  CURRENT_USER: 'hackathon_current_user',
} as const;

// ============= RESULT TYPE =============

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============= HELPER FUNCTIONS =============

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateInviteCode(teamName: string): string {
  const prefix = teamName.toUpperCase().replace(/\s+/g, '').substring(0, 5);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============= STATE MACHINE TRANSITIONS =============

const VALID_TRANSITIONS: Record<HackathonState, HackathonState[]> = {
  'DRAFT': ['REGISTRATION_OPEN'],
  'REGISTRATION_OPEN': ['SUBMISSION_OPEN', 'DRAFT'],
  'SUBMISSION_OPEN': ['JUDGING_OPEN', 'REGISTRATION_OPEN'],
  'JUDGING_OPEN': ['RESULTS_PUBLISHED', 'SUBMISSION_OPEN'],
  'RESULTS_PUBLISHED': ['DRAFT'], // Reset for new hackathon
};

// ============= STORE CLASS =============

class HackathonStore {
  private config: HackathonConfig;
  private users: Map<string, User>;
  private teams: Map<string, Team>;
  private submissions: Map<string, Submission>;
  private judgeAssignments: JudgeAssignment[];
  private scores: Map<string, Score>;
  private currentUserId: string | null;

  constructor() {
    // Load all data from localStorage
    this.config = loadFromStorage<HackathonConfig>(STORAGE_KEYS.CONFIG, {
      id: generateId(),
      name: 'GL Hackathon 2026',
      currentState: 'DRAFT',
      maxTeamSize: 4,
      maxTeams: 100,
      stateHistory: [],
      createdAt: Date.now(),
    });

    const usersArray = loadFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    this.users = new Map(usersArray.map(u => [u.id, u]));

    const teamsArray = loadFromStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    this.teams = new Map(teamsArray.map(t => [t.id, t]));

    const submissionsArray = loadFromStorage<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    this.submissions = new Map(submissionsArray.map(s => [s.id, s]));

    this.judgeAssignments = loadFromStorage<JudgeAssignment[]>(STORAGE_KEYS.JUDGE_ASSIGNMENTS, []);

    const scoresArray = loadFromStorage<Score[]>(STORAGE_KEYS.SCORES, []);
    this.scores = new Map(scoresArray.map(s => [s.id, s]));

    this.currentUserId = loadFromStorage<string | null>(STORAGE_KEYS.CURRENT_USER, null);

    // Initialize with demo data if empty
    if (this.users.size === 0) {
      this.initializeDemoData();
    }
  }

  private persist(): void {
    saveToStorage(STORAGE_KEYS.CONFIG, this.config);
    saveToStorage(STORAGE_KEYS.USERS, Array.from(this.users.values()));
    saveToStorage(STORAGE_KEYS.TEAMS, Array.from(this.teams.values()));
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, Array.from(this.submissions.values()));
    saveToStorage(STORAGE_KEYS.JUDGE_ASSIGNMENTS, this.judgeAssignments);
    saveToStorage(STORAGE_KEYS.SCORES, Array.from(this.scores.values()));
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUserId);
  }

  private initializeDemoData(): void {
    // Create admin
    const admin: User = {
      id: 'admin-1',
      email: 'admin@glhackathon.com',
      name: 'Admin User',
      skills: [],
      role: 'admin',
      teamId: null,
      createdAt: Date.now(),
    };
    this.users.set(admin.id, admin);

    // Create judges
    const judgeNames = ['Dr. Sharma', 'Prof. Patel', 'Ms. Gupta', 'Mr. Kumar', 'Dr. Singh'];
    judgeNames.forEach((name, i) => {
      const judge: User = {
        id: `judge-${i + 1}`,
        email: `${name.toLowerCase().replace(/[.\s]/g, '')}@glhackathon.com`,
        name,
        skills: [],
        role: 'judge',
        teamId: null,
        createdAt: Date.now(),
      };
      this.users.set(judge.id, judge);
    });

    // Create demo participants and teams
    const demoTeams = [
      { name: 'Code Ninjas', members: ['Anish K.', 'Priya M.', 'Rahul S.'] },
      { name: 'Data Hawks', members: ['Amit P.', 'Sneha R.', 'Vikram T.', 'Neha K.'] },
      { name: 'Tech Titans', members: ['Ravi S.', 'Deepa M.'] },
      { name: 'Binary Brains', members: ['Kiran L.', 'Pooja D.', 'Suresh M.'] },
      { name: 'Algo Wizards', members: ['Arjun K.', 'Meera S.', 'Anil R.', 'Divya P.'] },
      { name: 'Cloud Crew', members: ['Sanjay M.', 'Lakshmi V.', 'Prasad K.'] },
    ];

    demoTeams.forEach((team, teamIndex) => {
      const teamId = `team-${teamIndex + 1}`;
      const memberIds: string[] = [];

      team.members.forEach((memberName, memberIndex) => {
        const userId = `user-${teamIndex}-${memberIndex}`;
        const user: User = {
          id: userId,
          email: `${memberName.toLowerCase().replace(/[.\s]/g, '')}@example.com`,
          name: memberName,
          phone: '9876543210',
          skills: ['React', 'Python', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 1),
          role: 'participant',
          teamId,
          createdAt: Date.now(),
        };
        this.users.set(userId, user);
        memberIds.push(userId);
      });

      const newTeam: Team = {
        id: teamId,
        name: team.name,
        inviteCode: generateInviteCode(team.name),
        leaderId: memberIds[0],
        memberIds,
        submissionId: null,
        isLocked: false,
        isDisqualified: false,
        createdAt: Date.now(),
      };
      this.teams.set(teamId, newTeam);
    });

    this.persist();
  }

  // ============= CONFIG & STATE METHODS =============

  getConfig(): HackathonConfig {
    return { ...this.config };
  }

  getCurrentState(): HackathonState {
    return this.config.currentState;
  }

  transitionState(newState: HackathonState, changedBy: string): Result<HackathonState> {
    const validNextStates = VALID_TRANSITIONS[this.config.currentState];

    if (!validNextStates.includes(newState)) {
      return {
        success: false,
        error: `Cannot transition from ${this.config.currentState} to ${newState}. Valid transitions: ${validNextStates.join(', ')}`,
      };
    }

    // Lock all submissions when moving out of SUBMISSION_OPEN
    if (this.config.currentState === 'SUBMISSION_OPEN' && newState === 'JUDGING_OPEN') {
      this.submissions.forEach(sub => {
        sub.isLocked = true;
      });
    }

    this.config.stateHistory.push({
      state: this.config.currentState,
      changedAt: Date.now(),
      changedBy,
    });

    this.config.currentState = newState;
    this.persist();

    return { success: true, data: newState };
  }

  // ============= USER METHODS =============

  getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.get(this.currentUserId) || null;
  }

  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    this.persist();
  }

  getUserById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  getUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getParticipants(): User[] {
    return Array.from(this.users.values()).filter(u => u.role === 'participant');
  }

  getJudges(): User[] {
    return Array.from(this.users.values()).filter(u => u.role === 'judge');
  }

  registerUser(data: Omit<User, 'id' | 'teamId' | 'createdAt'>): Result<User> {
    // Check state
    if (this.config.currentState !== 'REGISTRATION_OPEN' && this.config.currentState !== 'DRAFT') {
      return { success: false, error: 'Registration is closed' };
    }

    // Check email uniqueness
    if (this.getUserByEmail(data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    const user: User = {
      ...data,
      id: generateId(),
      teamId: null,
      createdAt: Date.now(),
    };

    this.users.set(user.id, user);
    this.currentUserId = user.id;
    this.persist();

    return { success: true, data: user };
  }

  loginUser(email: string): Result<User> {
    const user = this.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    this.currentUserId = user.id;
    this.persist();
    return { success: true, data: user };
  }

  logoutUser(): void {
    this.currentUserId = null;
    this.persist();
  }

  // ============= TEAM METHODS =============

  getTeamById(teamId: string): Team | null {
    return this.teams.get(teamId) || null;
  }

  getTeamByInviteCode(code: string): Team | null {
    return Array.from(this.teams.values()).find(t => t.inviteCode === code) || null;
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getTeamMembers(teamId: string): User[] {
    const team = this.teams.get(teamId);
    if (!team) return [];
    return team.memberIds.map(id => this.users.get(id)).filter(Boolean) as User[];
  }

  createTeam(name: string, leaderId: string): Result<Team> {
    const leader = this.users.get(leaderId);
    if (!leader) {
      return { success: false, error: 'User not found' };
    }

    // Check if user already in a team
    if (leader.teamId) {
      return { success: false, error: 'You are already in a team' };
    }

    // Check state
    if (this.config.currentState !== 'REGISTRATION_OPEN' && this.config.currentState !== 'DRAFT') {
      return { success: false, error: 'Team creation is closed' };
    }

    // Check max teams
    if (this.teams.size >= this.config.maxTeams) {
      return { success: false, error: 'Maximum number of teams reached' };
    }

    const team: Team = {
      id: generateId(),
      name,
      inviteCode: generateInviteCode(name),
      leaderId,
      memberIds: [leaderId],
      submissionId: null,
      isLocked: false,
      isDisqualified: false,
      createdAt: Date.now(),
    };

    this.teams.set(team.id, team);
    leader.teamId = team.id;
    this.persist();

    return { success: true, data: team };
  }

  joinTeam(inviteCode: string, userId: string): Result<Team> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if user already in a team
    if (user.teamId) {
      return { success: false, error: 'You are already in a team. Leave your current team first.' };
    }

    const team = this.getTeamByInviteCode(inviteCode);
    if (!team) {
      return { success: false, error: 'Invalid invite code' };
    }

    // Check if team is locked
    if (team.isLocked) {
      return { success: false, error: 'This team is locked and cannot accept new members' };
    }

    // Check team size
    if (team.memberIds.length >= this.config.maxTeamSize) {
      return { success: false, error: `Team is full (max ${this.config.maxTeamSize} members)` };
    }

    // Check state - can't join after submissions open (teams lock on first submission)
    if (this.config.currentState === 'JUDGING_OPEN' || this.config.currentState === 'RESULTS_PUBLISHED') {
      return { success: false, error: 'Team changes are no longer allowed' };
    }

    team.memberIds.push(userId);
    user.teamId = team.id;
    this.persist();

    return { success: true, data: team };
  }

  leaveTeam(userId: string): Result<void> {
    const user = this.users.get(userId);
    if (!user || !user.teamId) {
      return { success: false, error: 'You are not in a team' };
    }

    const team = this.teams.get(user.teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Can't leave if team is locked
    if (team.isLocked) {
      return { success: false, error: 'Cannot leave team after submission' };
    }

    // Can't leave if you're the leader and team has members
    if (team.leaderId === userId && team.memberIds.length > 1) {
      return { success: false, error: 'Team leader cannot leave while team has other members. Transfer leadership first.' };
    }

    // Remove from team
    team.memberIds = team.memberIds.filter(id => id !== userId);
    user.teamId = null;

    // Delete team if empty
    if (team.memberIds.length === 0) {
      this.teams.delete(team.id);
    }

    this.persist();
    return { success: true, data: undefined };
  }

  disqualifyTeam(teamId: string): Result<Team> {
    const team = this.teams.get(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    team.isDisqualified = true;
    this.persist();
    return { success: true, data: team };
  }

  reinstateTeam(teamId: string): Result<Team> {
    const team = this.teams.get(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    team.isDisqualified = false;
    this.persist();
    return { success: true, data: team };
  }

  // ============= SUBMISSION METHODS =============

  getSubmissionById(submissionId: string): Submission | null {
    return this.submissions.get(submissionId) || null;
  }

  getSubmissionByTeam(teamId: string): Submission | null {
    return Array.from(this.submissions.values()).find(s => s.teamId === teamId) || null;
  }

  getAllSubmissions(): Submission[] {
    return Array.from(this.submissions.values());
  }

  createOrUpdateSubmission(teamId: string, data: Omit<Submission, 'id' | 'teamId' | 'submittedAt' | 'lastEditedAt' | 'isLocked'>): Result<Submission> {
    // Check state
    if (this.config.currentState !== 'SUBMISSION_OPEN') {
      return { success: false, error: 'Submissions are not currently open' };
    }

    const team = this.teams.get(teamId);
    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    if (team.isDisqualified) {
      return { success: false, error: 'Your team has been disqualified' };
    }

    // Check for existing submission
    const existingSubmission = this.getSubmissionByTeam(teamId);

    if (existingSubmission) {
      // Update existing
      if (existingSubmission.isLocked) {
        return { success: false, error: 'Submission is locked and cannot be edited' };
      }

      Object.assign(existingSubmission, data, { lastEditedAt: Date.now() });
      this.persist();
      return { success: true, data: existingSubmission };
    }

    // Create new submission
    const submission: Submission = {
      ...data,
      id: generateId(),
      teamId,
      submittedAt: Date.now(),
      lastEditedAt: Date.now(),
      isLocked: false,
    };

    this.submissions.set(submission.id, submission);
    team.submissionId = submission.id;
    team.isLocked = true; // Lock team composition after submission
    this.persist();

    return { success: true, data: submission };
  }

  lockSubmission(submissionId: string): Result<Submission> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    submission.isLocked = true;
    this.persist();
    return { success: true, data: submission };
  }

  unlockSubmission(submissionId: string): Result<Submission> {
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Only allow unlock if in SUBMISSION_OPEN state
    if (this.config.currentState !== 'SUBMISSION_OPEN') {
      return { success: false, error: 'Can only unlock submissions during submission phase' };
    }

    submission.isLocked = false;
    this.persist();
    return { success: true, data: submission };
  }

  // ============= JUDGE ASSIGNMENT METHODS =============

  getJudgeAssignments(judgeId: string): JudgeAssignment[] {
    return this.judgeAssignments.filter(a => a.judgeId === judgeId);
  }

  getSubmissionAssignments(submissionId: string): JudgeAssignment[] {
    return this.judgeAssignments.filter(a => a.submissionId === submissionId);
  }

  isJudgeAssignedToSubmission(judgeId: string, submissionId: string): boolean {
    return this.judgeAssignments.some(
      a => a.judgeId === judgeId && a.submissionId === submissionId
    );
  }

  assignJudgeToSubmission(judgeId: string, submissionId: string): Result<JudgeAssignment> {
    const judge = this.users.get(judgeId);
    if (!judge || judge.role !== 'judge') {
      return { success: false, error: 'Invalid judge' };
    }

    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Check if already assigned
    if (this.isJudgeAssignedToSubmission(judgeId, submissionId)) {
      return { success: false, error: 'Judge is already assigned to this submission' };
    }

    const assignment: JudgeAssignment = {
      judgeId,
      submissionId,
      assignedAt: Date.now(),
    };

    this.judgeAssignments.push(assignment);
    this.persist();

    return { success: true, data: assignment };
  }

  removeJudgeAssignment(judgeId: string, submissionId: string): Result<void> {
    const index = this.judgeAssignments.findIndex(
      a => a.judgeId === judgeId && a.submissionId === submissionId
    );

    if (index === -1) {
      return { success: false, error: 'Assignment not found' };
    }

    this.judgeAssignments.splice(index, 1);
    this.persist();

    return { success: true, data: undefined };
  }

  autoAssignJudges(): Result<number> {
    const judges = this.getJudges();
    const submissions = this.getAllSubmissions().filter(s => {
      const team = this.teams.get(s.teamId);
      return team && !team.isDisqualified;
    });

    if (judges.length === 0) {
      return { success: false, error: 'No judges available' };
    }

    if (submissions.length === 0) {
      return { success: false, error: 'No submissions to assign' };
    }

    let assignmentCount = 0;

    // Round-robin assignment: each submission gets assigned to all judges
    submissions.forEach(submission => {
      judges.forEach(judge => {
        if (!this.isJudgeAssignedToSubmission(judge.id, submission.id)) {
          this.judgeAssignments.push({
            judgeId: judge.id,
            submissionId: submission.id,
            assignedAt: Date.now(),
          });
          assignmentCount++;
        }
      });
    });

    this.persist();
    return { success: true, data: assignmentCount };
  }

  // ============= SCORING METHODS =============

  getScoreById(scoreId: string): Score | null {
    return this.scores.get(scoreId) || null;
  }

  getScoreByJudgeAndSubmission(judgeId: string, submissionId: string): Score | null {
    return Array.from(this.scores.values()).find(
      s => s.judgeId === judgeId && s.submissionId === submissionId
    ) || null;
  }

  getScoresForSubmission(submissionId: string): Score[] {
    return Array.from(this.scores.values()).filter(s => s.submissionId === submissionId);
  }

  getScoresByJudge(judgeId: string): Score[] {
    return Array.from(this.scores.values()).filter(s => s.judgeId === judgeId);
  }

  getAllScores(): Score[] {
    return Array.from(this.scores.values());
  }

  submitScore(
    judgeId: string,
    submissionId: string,
    scores: {
      innovation: number;
      execution: number;
      presentation: number;
      impact: number;
      codeQuality: number;
      comments: string;
      flagged: boolean;
    }
  ): Result<Score> {
    // Check state
    if (this.config.currentState !== 'JUDGING_OPEN') {
      return { success: false, error: 'Scoring is not currently open' };
    }

    // Validate judge
    const judge = this.users.get(judgeId);
    if (!judge || judge.role !== 'judge') {
      return { success: false, error: 'Invalid judge' };
    }

    // Validate submission
    const submission = this.submissions.get(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Check assignment
    if (!this.isJudgeAssignedToSubmission(judgeId, submissionId)) {
      return { success: false, error: 'You are not assigned to score this submission' };
    }

    // Check for duplicate score
    const existingScore = this.getScoreByJudgeAndSubmission(judgeId, submissionId);
    if (existingScore) {
      return { success: false, error: 'You have already scored this submission. Use updateScore to modify.' };
    }

    // Validate score ranges
    const scoreFields = ['innovation', 'execution', 'presentation', 'impact', 'codeQuality'] as const;
    for (const field of scoreFields) {
      if (scores[field] < 1 || scores[field] > 10) {
        return { success: false, error: `${field} must be between 1 and 10` };
      }
    }

    const score: Score = {
      id: generateId(),
      judgeId,
      submissionId,
      ...scores,
      submittedAt: Date.now(),
    };

    this.scores.set(score.id, score);
    this.persist();

    return { success: true, data: score };
  }

  updateScore(
    scoreId: string,
    updates: Partial<{
      innovation: number;
      execution: number;
      presentation: number;
      impact: number;
      codeQuality: number;
      comments: string;
      flagged: boolean;
    }>
  ): Result<Score> {
    // Check state
    if (this.config.currentState !== 'JUDGING_OPEN') {
      return { success: false, error: 'Scoring modifications are not currently allowed' };
    }

    const score = this.scores.get(scoreId);
    if (!score) {
      return { success: false, error: 'Score not found' };
    }

    // Validate score ranges
    const scoreFields = ['innovation', 'execution', 'presentation', 'impact', 'codeQuality'] as const;
    for (const field of scoreFields) {
      if (updates[field] !== undefined && (updates[field]! < 1 || updates[field]! > 10)) {
        return { success: false, error: `${field} must be between 1 and 10` };
      }
    }

    Object.assign(score, updates, { submittedAt: Date.now() });
    this.persist();

    return { success: true, data: score };
  }

  calculateTotalScore(score: Score): number {
    // Weights: Innovation 25%, Execution 25%, Presentation 20%, Impact 20%, Code Quality 10%
    return (
      score.innovation * 2.5 +
      score.execution * 2.5 +
      score.presentation * 2.0 +
      score.impact * 2.0 +
      score.codeQuality * 1.0
    );
  }

  calculateAverageScore(submissionId: string): number | null {
    const scores = this.getScoresForSubmission(submissionId);
    if (scores.length === 0) return null;

    const totalScores = scores.map(s => this.calculateTotalScore(s));
    return totalScores.reduce((a, b) => a + b, 0) / totalScores.length;
  }

  // ============= LEADERBOARD METHODS =============

  getLeaderboard(): Array<{
    rank: number;
    team: Team;
    submission: Submission;
    averageScore: number;
    scoreCount: number;
  }> {
    const submissions = this.getAllSubmissions();

    const leaderboardData = submissions
      .map(submission => {
        const team = this.teams.get(submission.teamId);
        if (!team || team.isDisqualified) return null;

        const avgScore = this.calculateAverageScore(submission.id);
        const scoreCount = this.getScoresForSubmission(submission.id).length;

        return {
          team,
          submission,
          averageScore: avgScore || 0,
          scoreCount,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.averageScore - a!.averageScore);

    return leaderboardData.map((item, index) => ({
      rank: index + 1,
      team: item!.team,
      submission: item!.submission,
      averageScore: item!.averageScore,
      scoreCount: item!.scoreCount,
    }));
  }

  // ============= CSV EXPORT METHODS =============

  exportTeamsCSV(): string {
    const teams = this.getAllTeams();
    const headers = ['Team ID', 'Team Name', 'Invite Code', 'Leader', 'Members', 'Member Count', 'Has Submission', 'Is Locked', 'Is Disqualified', 'Created At'];

    const rows = teams.map(team => {
      const leader = this.users.get(team.leaderId);
      const members = this.getTeamMembers(team.id);
      return [
        team.id,
        team.name,
        team.inviteCode,
        leader?.name || 'Unknown',
        members.map(m => m.name).join('; '),
        team.memberIds.length.toString(),
        team.submissionId ? 'Yes' : 'No',
        team.isLocked ? 'Yes' : 'No',
        team.isDisqualified ? 'Yes' : 'No',
        new Date(team.createdAt).toISOString(),
      ];
    });

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }

  exportSubmissionsCSV(): string {
    const submissions = this.getAllSubmissions();
    const headers = ['Submission ID', 'Team ID', 'Team Name', 'Title', 'Problem Statement', 'Tech Stack', 'GitHub URL', 'Demo URL', 'Is Locked', 'Submitted At', 'Last Edited At'];

    const rows = submissions.map(sub => {
      const team = this.teams.get(sub.teamId);
      return [
        sub.id,
        sub.teamId,
        team?.name || 'Unknown',
        sub.title,
        sub.problemStatement,
        sub.techStack.join('; '),
        sub.githubUrl,
        sub.demoUrl,
        sub.isLocked ? 'Yes' : 'No',
        new Date(sub.submittedAt).toISOString(),
        new Date(sub.lastEditedAt).toISOString(),
      ];
    });

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }

  exportScoresCSV(): string {
    const scores = this.getAllScores();
    const headers = ['Score ID', 'Judge ID', 'Judge Name', 'Submission ID', 'Team Name', 'Innovation', 'Execution', 'Presentation', 'Impact', 'Code Quality', 'Total Score', 'Comments', 'Flagged', 'Submitted At'];

    const rows = scores.map(score => {
      const judge = this.users.get(score.judgeId);
      const submission = this.submissions.get(score.submissionId);
      const team = submission ? this.teams.get(submission.teamId) : null;
      const totalScore = this.calculateTotalScore(score);

      return [
        score.id,
        score.judgeId,
        judge?.name || 'Unknown',
        score.submissionId,
        team?.name || 'Unknown',
        score.innovation.toString(),
        score.execution.toString(),
        score.presentation.toString(),
        score.impact.toString(),
        score.codeQuality.toString(),
        totalScore.toFixed(1),
        score.comments,
        score.flagged ? 'Yes' : 'No',
        new Date(score.submittedAt).toISOString(),
      ];
    });

    return [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  }

  // ============= RESET METHOD =============

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.JUDGE_ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEYS.SCORES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    // Re-initialize
    this.config = {
      id: generateId(),
      name: 'GL Hackathon 2026',
      currentState: 'DRAFT',
      maxTeamSize: 4,
      maxTeams: 100,
      stateHistory: [],
      createdAt: Date.now(),
    };
    this.users = new Map();
    this.teams = new Map();
    this.submissions = new Map();
    this.judgeAssignments = [];
    this.scores = new Map();
    this.currentUserId = null;

    this.initializeDemoData();
  }
}

// Export singleton instance
export const hackathonStore = new HackathonStore();

// Export for testing
export { HackathonStore };
