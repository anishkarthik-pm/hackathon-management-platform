import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Upload, X, Check, Github, Video, FileArchive, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useHackathonData, useCurrentTeam, useCurrentSubmission, useCanSubmit } from '@/context/HackathonDataContext';

const techStackOptions = [
  'React', 'Python', 'Flask', 'AWS', 'Node.js', 'MongoDB', 'TensorFlow', 'Docker',
  'TypeScript', 'PostgreSQL', 'Firebase', 'OpenAI', 'Tailwind', 'Next.js', 'Vue', 'Angular'
];

const SubmissionFormPage = () => {
  const navigate = useNavigate();
  const { currentState, currentUser, createOrUpdateSubmission } = useHackathonData();
  const { team } = useCurrentTeam();
  const existingSubmission = useCurrentSubmission();
  const { canSubmit, reason: cannotSubmitReason } = useCanSubmit();

  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    description: '',
    github: '',
    demo: ''
  });

  // Load existing submission data
  useEffect(() => {
    if (existingSubmission) {
      setFormData({
        title: existingSubmission.title,
        problem: existingSubmission.problemStatement,
        description: existingSubmission.description,
        github: existingSubmission.githubUrl,
        demo: existingSubmission.demoUrl
      });
      setSelectedTech(existingSubmission.techStack);
      setUploadedFile({
        name: existingSubmission.fileName,
        size: existingSubmission.fileSize
      });
      setConfirmed(true);
    }
  }, [existingSubmission]);

  // Redirect if not logged in or not in team
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    if (!team) {
      toast.error('You must be in a team to submit');
      navigate('/team-setup');
    }
  }, [currentUser, team, navigate]);

  const toggleTech = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.zip')) {
        toast.error('Only ZIP files are allowed');
        return;
      }
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setUploadedFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      toast.success('File uploaded successfully');
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Project title is required';
    }
    if (!formData.problem) {
      return 'Please select a problem statement';
    }
    if (!formData.description.trim()) {
      return 'Project description is required';
    }
    if (formData.description.length > 500) {
      return 'Description must be 500 characters or less';
    }
    if (!uploadedFile) {
      return 'Please upload your project files';
    }
    if (!formData.github.trim()) {
      return 'GitHub repository link is required';
    }
    if (!formData.github.startsWith('https://github.com/')) {
      return 'Please enter a valid GitHub URL';
    }
    if (!confirmed) {
      return 'Please confirm this is original work';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if can submit
    if (!canSubmit) {
      toast.error(cannotSubmitReason);
      return;
    }

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    const result = createOrUpdateSubmission({
      title: formData.title.trim(),
      problemStatement: formData.problem,
      description: formData.description.trim(),
      githubUrl: formData.github.trim(),
      demoUrl: formData.demo.trim(),
      techStack: selectedTech,
      fileName: uploadedFile!.name,
      fileSize: uploadedFile!.size,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(existingSubmission ? 'Submission updated successfully!' : 'Project submitted successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const charCount = formData.description.length;
  const maxChars = 500;

  // Show blocked state if can't submit
  const isBlocked = !canSubmit || existingSubmission?.isLocked;

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
        <button onClick={() => navigate('/')} className="text-text-secondary hover:text-white text-sm">Logout</button>
      </header>

      <div className="px-6 lg:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {/* State Warning */}
          {isBlocked && (
            <Card className="bg-red-500/20 border-red-500/30 rounded-2xl p-4 card-shadow mb-8">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-red-500 font-medium">
                    {existingSubmission?.isLocked
                      ? 'Submission is locked'
                      : 'Submissions are closed'}
                  </p>
                  <p className="text-text-secondary text-sm">
                    {cannotSubmitReason || 'Your submission has been locked and cannot be modified.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Timer Bar */}
          {currentState === 'SUBMISSION_OPEN' && (
            <Card className="bg-navy-secondary border-cyan/30 rounded-2xl p-4 card-shadow mb-8">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-cyan" />
                <span className="text-text-secondary">SUBMISSION STATUS:</span>
                <span className="font-mono text-xl text-cyan font-bold">
                  {existingSubmission ? 'EDITING' : 'OPEN'}
                </span>
              </div>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <Card className="bg-navy-secondary border-white/10 rounded-3xl p-8 card-shadow mb-6">
              <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  {existingSubmission ? 'EDIT YOUR SUBMISSION' : 'SUBMIT YOUR PROJECT'}
                </h1>
                <p className="text-text-secondary">Team: {team?.name || 'Unknown'}</p>
              </div>

              <div className="space-y-6">
                {/* Project Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Project Title*</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="h-12 bg-navy-primary border-white/10 text-white focus:border-cyan"
                    placeholder="e.g., EduPath - AI Learning Companion"
                    required
                    disabled={isBlocked}
                  />
                </div>

                {/* Problem Statement */}
                <div className="space-y-2">
                  <Label htmlFor="problem" className="text-white">Problem Statement Chosen*</Label>
                  <Select
                    value={formData.problem}
                    onValueChange={(value) => setFormData({...formData, problem: value})}
                    disabled={isBlocked}
                  >
                    <SelectTrigger className="h-12 bg-navy-primary border-white/10 text-white focus:border-cyan">
                      <SelectValue placeholder="Select a problem statement" />
                    </SelectTrigger>
                    <SelectContent className="bg-navy-secondary border-white/10">
                      <SelectItem value="personalized-learning">Personalized Learning Paths</SelectItem>
                      <SelectItem value="gamified-assessment">Gamified Skill Assessment</SelectItem>
                      <SelectItem value="open-innovation">Open Innovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Project Description* (500 chars max)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="min-h-[120px] bg-navy-primary border-white/10 text-white focus:border-cyan resize-none"
                    maxLength={maxChars}
                    placeholder="Describe your project, its features, and how it solves the problem..."
                    required
                    disabled={isBlocked}
                  />
                  <p className={`text-sm text-right ${charCount > maxChars * 0.9 ? 'text-yellow-500' : 'text-text-secondary'}`}>
                    Characters: {charCount}/{maxChars}
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-white">Upload Project Files* (ZIP, max 50MB)</Label>
                  <div className="bg-navy-primary border border-white/10 rounded-xl p-4">
                    {uploadedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center">
                            <FileArchive className="w-5 h-5 text-cyan" />
                          </div>
                          <div>
                            <p className="text-white text-sm">{uploadedFile.name}</p>
                            <p className="text-text-secondary text-xs">{uploadedFile.size}</p>
                          </div>
                        </div>
                        {!isBlocked && (
                          <button
                            type="button"
                            onClick={() => setUploadedFile(null)}
                            className="text-text-secondary hover:text-red-400 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className={`border-2 border-dashed border-white/20 rounded-lg p-8 text-center transition-colors block ${
                        isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:border-cyan/50 cursor-pointer'
                      }`}>
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isBlocked}
                        />
                        <Upload className="w-8 h-8 text-cyan mx-auto mb-2" />
                        <p className="text-text-secondary text-sm">Click to upload or drag and drop</p>
                      </label>
                    )}
                    {uploadedFile && !isBlocked && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={isBlocked}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-3 text-cyan hover:text-cyan/80"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4 mr-2" /> Replace File
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>

                {/* GitHub Link */}
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-white">GitHub Repository Link*</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <Input
                      id="github"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      className="h-12 bg-navy-primary border-white/10 text-white focus:border-cyan pl-10"
                      placeholder="https://github.com/username/repo"
                      required
                      disabled={isBlocked}
                    />
                  </div>
                </div>

                {/* Demo Video */}
                <div className="space-y-2">
                  <Label htmlFor="demo" className="text-white">Demo Video Link (Optional - YouTube/Loom)</Label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <Input
                      id="demo"
                      value={formData.demo}
                      onChange={(e) => setFormData({...formData, demo: e.target.value})}
                      className="h-12 bg-navy-primary border-white/10 text-white focus:border-cyan pl-10"
                      placeholder="https://..."
                      disabled={isBlocked}
                    />
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-3">
                  <Label className="text-white">Tech Stack Used</Label>
                  <div className="flex flex-wrap gap-2">
                    {techStackOptions.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => !isBlocked && toggleTech(tech)}
                        disabled={isBlocked}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTech.includes(tech)
                            ? 'bg-cyan text-navy-primary'
                            : 'bg-navy-primary border border-white/20 text-text-secondary hover:border-cyan/50'
                        } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {selectedTech.includes(tech) && <Check className="w-3 h-3 inline mr-1" />}
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirmation */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="confirm"
                    checked={confirmed}
                    onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-cyan data-[state=checked]:border-cyan"
                    disabled={isBlocked}
                  />
                  <Label htmlFor="confirm" className="text-text-secondary text-sm cursor-pointer">
                    I confirm this is original work by our team
                  </Label>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!confirmed || isSubmitting || isBlocked}
              className="w-full h-14 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-lg rounded-xl glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isBlocked ? (
                <>
                  <Lock className="w-5 h-5 mr-2" /> SUBMISSION LOCKED
                </>
              ) : existingSubmission ? (
                <>
                  <Check className="w-5 h-5 mr-2" /> UPDATE SUBMISSION
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" /> SUBMIT PROJECT
                </>
              )}
            </Button>

            {/* Warning */}
            {!isBlocked && (
              <div className="flex items-center justify-center gap-2 mt-4 text-text-secondary text-sm">
                <AlertTriangle className="w-4 h-4" />
                You can edit your submission until the deadline
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionFormPage;
