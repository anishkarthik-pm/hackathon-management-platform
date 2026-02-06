import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type HackathonStage = 
  | 'registered' 
  | 'awaiting' 
  | 'in-progress' 
  | 'submitted' 
  | 'under-review' 
  | 'results';

interface StageInfo {
  id: HackathonStage;
  label: string;
  description: string;
  color: string;
}

export const STAGES: StageInfo[] = [
  { id: 'registered', label: 'Registered', description: 'You have successfully registered', color: 'cyan' },
  { id: 'awaiting', label: 'Awaiting Hackathon', description: 'Waiting for the event to start', color: 'yellow' },
  { id: 'in-progress', label: 'In Progress', description: 'Hackathon is live! Submit your project', color: 'green' },
  { id: 'submitted', label: 'Submitted', description: 'Project submitted successfully', color: 'blue' },
  { id: 'under-review', label: 'Under Review', description: 'Judges are evaluating projects', color: 'purple' },
  { id: 'results', label: 'Results', description: 'Winners have been announced!', color: 'gold' },
];

interface HackathonStageContextType {
  currentStage: HackathonStage;
  setStage: (stage: HackathonStage) => void;
  nextStage: () => void;
  previousStage: () => void;
  getStageIndex: () => number;
  isStageActive: (stage: HackathonStage) => boolean;
  isStageCompleted: (stage: HackathonStage) => boolean;
  showSimulator: boolean;
  setShowSimulator: (show: boolean) => void;
}

const HackathonStageContext = createContext<HackathonStageContextType | undefined>(undefined);

export function HackathonStageProvider({ children }: { children: ReactNode }) {
  const [currentStage, setCurrentStage] = useState<HackathonStage>('registered');
  const [showSimulator, setShowSimulator] = useState(true);

  const setStage = useCallback((stage: HackathonStage) => {
    setCurrentStage(stage);
  }, []);

  const nextStage = useCallback(() => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    if (currentIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[currentIndex + 1].id);
    }
  }, [currentStage]);

  const previousStage = useCallback(() => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    if (currentIndex > 0) {
      setCurrentStage(STAGES[currentIndex - 1].id);
    }
  }, [currentStage]);

  const getStageIndex = useCallback(() => {
    return STAGES.findIndex(s => s.id === currentStage);
  }, [currentStage]);

  const isStageActive = useCallback((stage: HackathonStage) => {
    return currentStage === stage;
  }, [currentStage]);

  const isStageCompleted = useCallback((stage: HackathonStage) => {
    const stageIndex = STAGES.findIndex(s => s.id === stage);
    const currentIndex = getStageIndex();
    return stageIndex < currentIndex;
  }, [currentStage, getStageIndex]);

  return (
    <HackathonStageContext.Provider
      value={{
        currentStage,
        setStage,
        nextStage,
        previousStage,
        getStageIndex,
        isStageActive,
        isStageCompleted,
        showSimulator,
        setShowSimulator,
      }}
    >
      {children}
    </HackathonStageContext.Provider>
  );
}

export function useHackathonStage() {
  const context = useContext(HackathonStageContext);
  if (context === undefined) {
    throw new Error('useHackathonStage must be used within a HackathonStageProvider');
  }
  return context;
}
