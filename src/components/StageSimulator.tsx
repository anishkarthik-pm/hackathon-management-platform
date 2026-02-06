import { useHackathonStage, STAGES, type HackathonStage } from '@/context/HackathonStageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, RotateCcw, X, Settings2 } from 'lucide-react';

export function StageSimulator() {
  const { 
    currentStage, 
    setStage, 
    nextStage, 
    previousStage, 
    getStageIndex,
    isStageCompleted,
    showSimulator,
    setShowSimulator 
  } = useHackathonStage();

  const currentIndex = getStageIndex();
  const progress = ((currentIndex + 1) / STAGES.length) * 100;

  if (!showSimulator) {
    return (
      <button
        onClick={() => setShowSimulator(true)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 bg-cyan text-navy-primary rounded-full shadow-lg hover:bg-cyan/90 flex items-center justify-center"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 bg-navy-secondary border-cyan/50 rounded-2xl p-4 shadow-2xl w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan animate-pulse" />
          <span className="text-white font-semibold text-sm">Stage Simulator</span>
        </div>
        <button 
          onClick={() => setShowSimulator(false)}
          className="text-text-secondary hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Current Stage Display */}
      <div className="mb-4">
        <div className="text-text-secondary text-xs mb-1">Current Stage</div>
        <div className="text-cyan font-bold text-lg">
          {STAGES.find(s => s.id === currentStage)?.label}
        </div>
        <div className="text-text-secondary text-xs">
          {STAGES.find(s => s.id === currentStage)?.description}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-navy-primary rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage Selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {STAGES.map((stage, index) => (
          <button
            key={stage.id}
            onClick={() => setStage(stage.id)}
            className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              currentStage === stage.id
                ? 'bg-cyan text-navy-primary'
                : isStageCompleted(stage.id)
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-navy-primary text-text-secondary hover:text-white'
            }`}
          >
            {index + 1}. {stage.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={previousStage}
          disabled={currentIndex === 0}
          className="flex-1 border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStage('registered')}
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={nextStage}
          disabled={currentIndex === STAGES.length - 1}
          className="flex-1 bg-cyan text-navy-primary hover:bg-cyan/90 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-text-secondary text-xs mb-2">Quick Jump</div>
        <div className="flex gap-2">
          <button
            onClick={() => setStage('in-progress')}
            className="flex-1 px-2 py-1.5 bg-green-500/20 text-green-500 rounded-lg text-xs hover:bg-green-500/30 transition-colors"
          >
            <Play className="w-3 h-3 inline mr-1" /> Start
          </button>
          <button
            onClick={() => setStage('submitted')}
            className="flex-1 px-2 py-1.5 bg-blue-500/20 text-blue-500 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
          >
            Submit
          </button>
          <button
            onClick={() => setStage('results')}
            className="flex-1 px-2 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg text-xs hover:bg-yellow-500/30 transition-colors"
          >
            Results
          </button>
        </div>
      </div>
    </Card>
  );
}

// Stage Badge Component for use in other components
export function StageBadge({ stage }: { stage: HackathonStage }) {
  const stageInfo = STAGES.find(s => s.id === stage);
  if (!stageInfo) return null;

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan/20 text-cyan',
    yellow: 'bg-yellow-500/20 text-yellow-500',
    green: 'bg-green-500/20 text-green-500',
    blue: 'bg-blue-500/20 text-blue-500',
    purple: 'bg-purple-500/20 text-purple-500',
    gold: 'bg-yellow-400/20 text-yellow-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[stageInfo.color]}`}>
      {stageInfo.label}
    </span>
  );
}

// Stage Timeline Component
export function StageTimeline() {
  const { currentStage, isStageCompleted } = useHackathonStage();

  return (
    <div className="flex items-center justify-between">
      {STAGES.map((stage, index) => {
        const isCompleted = isStageCompleted(stage.id);
        const isActive = currentStage === stage.id;

        return (
          <div key={stage.id} className="flex flex-col items-center relative">
            {/* Connector Line */}
            {index < STAGES.length - 1 && (
              <div 
                className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  isCompleted ? 'bg-cyan' : 'bg-white/10'
                }`}
                style={{ width: 'calc(100% + 20px)' }}
              />
            )}

            {/* Stage Circle */}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                isActive 
                  ? 'bg-cyan text-navy-primary ring-4 ring-cyan/30'
                  : isCompleted
                    ? 'bg-cyan text-navy-primary'
                    : 'bg-navy-primary border-2 border-white/20 text-text-secondary'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>

            {/* Label */}
            <span className={`text-xs mt-2 text-center max-w-[80px] ${
              isActive ? 'text-cyan font-medium' : isCompleted ? 'text-white' : 'text-text-secondary'
            }`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
