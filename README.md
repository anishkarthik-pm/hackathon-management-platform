# Hackathon Management Platform

A complete, production-ready hackathon management platform built with React, TypeScript, and Vite. This platform handles the entire hackathon lifecycle from registration to results, with robust state management, team constraints, and admin controls.

## Features

### Hackathon Lifecycle State Machine
The platform implements a strict state machine that controls all actions:

```
DRAFT → REGISTRATION_OPEN → SUBMISSION_OPEN → JUDGING_OPEN → RESULTS_PUBLISHED
```

| State | Description |
|-------|-------------|
| **DRAFT** | Initial setup phase. Only admins can access. |
| **REGISTRATION_OPEN** | Participants can register and form teams. |
| **SUBMISSION_OPEN** | Teams can submit their projects. |
| **JUDGING_OPEN** | Judges score submissions. Participants wait. |
| **RESULTS_PUBLISHED** | Final scores and rankings visible to all. |

### Team Management
- **Max Team Size**: Configurable (default: 4 members)
- **Composition Lock**: Teams are locked after making a submission
- **No Multi-Team**: Users cannot join multiple teams simultaneously
- **Invite Codes**: Teams have unique codes for joining
- **Graceful Errors**: Clear toast notifications for all edge cases

### Submission System
- **One Per Team**: Each team can only have one submission
- **Editable**: Submissions can be edited during SUBMISSION_OPEN phase
- **Auto-Lock**: Submissions automatically lock when judging begins
- **Manual Override**: Admins can lock/unlock individual submissions
- **Rich Content**: Title, description, tech stack, GitHub URL, demo video, screenshots

### Judge Assignment & Scoring
- **Assignment System**: Judges are assigned to specific submissions
- **No Unassigned Scoring**: Judges can only score their assigned submissions
- **No Duplicate Scores**: Each judge can only score a submission once
- **Score Updates**: Existing scores can be updated during judging phase
- **5 Criteria**: Innovation, Execution, Presentation, Impact, Code Quality

### Admin Dashboard
- **State Transitions**: Control hackathon phases with confirmation dialogs
- **Team Management**: View all teams, disqualify/reinstate teams
- **Submission Control**: View submissions, lock/unlock individually
- **Judge Management**: View judge stats, auto-assign submissions
- **CSV Exports**: Export teams, submissions, and scores to CSV

## Tech Stack

- **Frontend**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 7.3
- **Routing**: React Router DOM 7.13
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4.1
- **Notifications**: Sonner (toast notifications)
- **Data Persistence**: LocalStorage (MVP approach)

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components (shadcn/ui)
│   └── StageSimulator.tsx  # Dev tool for testing states
├── context/
│   ├── HackathonDataContext.tsx  # Main data context wrapper
│   └── HackathonStageContext.tsx # Legacy stage context
├── store/
│   └── hackathonStore.ts   # Centralized data store with all business logic
├── pages/
│   ├── LandingPage.tsx         # Public landing page
│   ├── RoleSelectionPage.tsx   # Choose participant/judge/admin
│   ├── RegistrationPage.tsx    # Participant registration
│   ├── TeamFormationPage.tsx   # Create/join teams
│   ├── SubmissionFormPage.tsx  # Submit projects
│   ├── ParticipantDashboard.tsx # Participant home
│   ├── JudgeLoginPage.tsx      # Judge login
│   ├── JudgeDashboard.tsx      # Judge home with assignments
│   ├── ScoringInterfacePage.tsx # Score submissions
│   ├── AdminLoginPage.tsx      # Admin login
│   ├── AdminDashboard.tsx      # Admin control panel
│   └── LeaderboardPage.tsx     # Public results
├── hooks/
│   └── use-mobile.ts       # Mobile detection hook
├── lib/
│   └── utils.ts            # Utility functions
└── App.tsx                 # Main app with routing
```

## User Flows

### Participant Flow

```
1. Landing Page → Role Selection → "Participant"
2. Registration Page → Enter details → Create account
3. Team Formation:
   - Create new team (becomes leader) OR
   - Join existing team with invite code
4. Wait for SUBMISSION_OPEN phase
5. Submission Form → Enter project details → Submit
6. Wait for JUDGING_OPEN phase
7. View results on Leaderboard when RESULTS_PUBLISHED
```

### Judge Flow

```
1. Landing Page → Role Selection → "Judge"
2. Judge Login → Enter credentials
3. Judge Dashboard:
   - View assigned submissions
   - See scoring progress
   - Filter by status (pending/scored)
4. Scoring Interface:
   - Rate 5 criteria (1-10 scale)
   - Add comments
   - Flag if needed
   - Save and continue to next
5. Review completed scores
```

### Admin Flow

```
1. Landing Page → Role Selection → "Admin"
2. Admin Login → Enter credentials
3. Admin Dashboard:
   - View hackathon stats
   - Control state transitions
   - Manage teams (view, disqualify)
   - Manage submissions (view, lock/unlock)
   - Manage judges (view, auto-assign)
   - Export data to CSV
```

## State-Gated Actions

| Action | Allowed States |
|--------|---------------|
| Register | DRAFT, REGISTRATION_OPEN |
| Create/Join Team | DRAFT, REGISTRATION_OPEN |
| Leave Team | DRAFT, REGISTRATION_OPEN (if no submission) |
| Submit Project | SUBMISSION_OPEN |
| Edit Submission | SUBMISSION_OPEN |
| Score Submission | JUDGING_OPEN |
| View Leaderboard | JUDGING_OPEN, RESULTS_PUBLISHED |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/anishkarthik-pm/hackathon-management-platform.git
cd hackathon-management-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Demo Accounts

The platform initializes with demo data for testing:

**Participants** (6 demo teams):
- Login as any team member email (e.g., `rahulkumar@example.com`)

**Judges** (5 demo judges):
- `drsharma@glhackathon.com` - Dr. Ananya Sharma
- `vikram@glhackathon.com` - Vikram Mehta
- `priya@glhackathon.com` - Priya Iyer
- `arjun@glhackathon.com` - Arjun Reddy
- `meera@glhackathon.com` - Meera Kapoor

**Admin**:
- `admin@glhackathon.com`

## API / Data Store

The `hackathonStore.ts` provides all business logic:

```typescript
// State Management
transitionState(newState): Result<void>
getCurrentState(): HackathonState

// User Management
registerUser(data): Result<User>
loginUser(email): Result<User>

// Team Management
createTeam(name, leaderId): Result<Team>
joinTeam(userId, inviteCode): Result<void>
leaveTeam(userId): Result<void>
disqualifyTeam(teamId): Result<void>

// Submission Management
createSubmission(teamId, data): Result<Submission>
updateSubmission(id, data): Result<void>
lockSubmission(id): Result<void>

// Scoring
submitScore(submissionId, data): Result<Score>
updateScore(id, data): Result<void>
assignJudgeToSubmission(judgeId, submissionId): Result<void>
autoAssignJudges(): Result<void>

// Queries
getAllTeams(): Team[]
getAllSubmissions(): Submission[]
getLeaderboard(): LeaderboardEntry[]
exportTeamsCSV(): string
exportSubmissionsCSV(): string
exportScoresCSV(): string
```

## Error Handling

All operations return a `Result<T>` type:

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Errors are displayed as toast notifications with clear, actionable messages.

## Configuration

Edit `src/store/hackathonStore.ts` to customize:

```typescript
// Team size limit
private maxTeamSize = 4;

// Scoring criteria weights
const criteria = [
  { key: 'innovation', weight: 25 },
  { key: 'execution', weight: 25 },
  { key: 'presentation', weight: 20 },
  { key: 'impact', weight: 20 },
  { key: 'codeQuality', weight: 10 },
];
```

## Build for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with React + TypeScript + Vite
