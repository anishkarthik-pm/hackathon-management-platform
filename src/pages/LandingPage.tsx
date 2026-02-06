import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Users, Trophy, ArrowRight, CheckCircle, Clock, FileText, MessageCircle, Download, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const prizesRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.fromTo('.hero-photo',
        { opacity: 0, scale: 1.08, x: '-8vw', rotateY: 8 },
        { opacity: 1, scale: 1, x: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' }
      );
      gsap.fromTo('.hero-title',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo('.hero-subtitle',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.35 }
      );
      gsap.fromTo('.info-card',
        { x: '10vw', opacity: 0, rotateZ: 2 },
        { x: 0, opacity: 1, rotateZ: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12, delay: 0.4 }
      );
      gsap.fromTo('.hero-cta',
        { y: '6vh', opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.7 }
      );

      // Timeline scroll animation
      gsap.fromTo('.timeline-title',
        { x: '-40vw', opacity: 0 },
        { x: 0, opacity: 1, scrollTrigger: { trigger: timelineRef.current, start: 'top 80%', end: 'top 40%', scrub: 1 } }
      );
      gsap.fromTo('.timeline-track',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, scrollTrigger: { trigger: timelineRef.current, start: 'top 70%', end: 'top 30%', scrub: 1 } }
      );
      gsap.fromTo('.timeline-node',
        { y: '12vh', scale: 0.6, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, stagger: 0.1, scrollTrigger: { trigger: timelineRef.current, start: 'top 60%', end: 'top 20%', scrub: 1 } }
      );

      // Prizes scroll animation
      gsap.fromTo('.prizes-title',
        { y: '-12vh', opacity: 0 },
        { y: 0, opacity: 1, scrollTrigger: { trigger: prizesRef.current, start: 'top 80%', end: 'top 50%', scrub: 1 } }
      );
      gsap.fromTo('.prize-card',
        { y: '100vh', rotateX: 35, opacity: 0 },
        { y: 0, rotateX: 0, opacity: 1, stagger: 0.1, scrollTrigger: { trigger: prizesRef.current, start: 'top 70%', end: 'top 30%', scrub: 1 } }
      );

      // Rules scroll animation
      gsap.fromTo('.rules-title',
        { x: '-10vw', opacity: 0 },
        { x: 0, opacity: 1, scrollTrigger: { trigger: rulesRef.current, start: 'top 80%', end: 'top 50%', scrub: 1 } }
      );
      gsap.fromTo('.rule-item',
        { x: '-6vw', opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, scrollTrigger: { trigger: rulesRef.current, start: 'top 70%', end: 'top 30%', scrub: 1 } }
      );
    });

    return () => ctx.revert();
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const rules = [
    {
      title: 'Exclusive to Great Learning learners',
      details: 'This hackathon is open to all enrolled Great Learning students — developers, data analysts, and tech learners. Verify your enrollment during registration.'
    },
    {
      title: 'Team size: 2-4 members',
      details: 'Each team must have 2-4 members. Don\'t have a team? No worries — solo registrants will be paired with other participants to form teams before the hackathon begins.'
    },
    {
      title: 'Duration: 24 hours',
      details: 'The hackathon runs for exactly 24 hours from Feb 15, 9 AM IST to Feb 16, 9 AM IST. All submissions must be made before the deadline.'
    },
    {
      title: 'Original work only',
      details: 'All code and assets must be created during the hackathon. Using open-source libraries is allowed. Pre-existing projects are not permitted.'
    },
    {
      title: 'Submit your code + a short demo',
      details: 'Submit a public GitHub repository with your code and a working demo (deployed app or video walkthrough). README should include setup instructions.'
    },
    {
      title: 'Judging criteria',
      details: 'Projects will be judged on innovation (25%), execution (25%), presentation (20%), impact (20%), and code quality (10%). All skill levels welcome!'
    },
  ];

  const faqs = [
    { q: 'Who can participate?', a: 'This hackathon is exclusively for Great Learning enrolled students — developers, data analysts, and all tech learners. You\'ll verify your enrollment during registration.' },
    { q: 'Is there a registration fee?', a: 'No, participation is completely free for all Great Learning learners!' },
    { q: 'What if I don\'t have a team?', a: 'No problem! Register as a solo participant and we\'ll pair you with other learners to form a team before Feb 15. You\'ll have time to connect and plan together.' },
    { q: 'Can I work remotely?', a: 'Yes! This is a fully virtual hackathon. Participate from anywhere with a stable internet connection.' },
    { q: 'What tech stack can I use?', a: 'Use any language, framework, or tools you\'re comfortable with. We judge ideas and execution, not specific technologies.' },
    { q: 'Do I need to be online for 24 hours?', a: 'No! Work at your own pace within the 24-hour window. Coordinate with your team on shifts if needed. Just submit before the deadline.' },
  ];

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-primary/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4">
          <div className="font-display text-2xl font-bold text-cyan tracking-wider cursor-pointer" onClick={() => navigate('/')}>GL</div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection(timelineRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Timeline</button>
            <button onClick={() => scrollToSection(prizesRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Prizes</button>
            <button onClick={() => scrollToSection(rulesRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Rules</button>
            <button onClick={() => navigate('/problem')} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Problem</button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/select-role')} className="text-text-secondary hover:text-white">Login</Button>
            <Button onClick={() => navigate('/select-role')} className="bg-cyan text-navy-primary hover:bg-cyan/90 font-semibold">Register</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen pt-20 flex items-center px-6 lg:px-12">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
          {/* Hero Photo Card */}
          <div className="lg:col-span-8 relative">
            <div className="hero-photo relative rounded-3xl overflow-hidden card-shadow scanlines" style={{ height: '64vh' }}>
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=800&fit=crop" 
                alt="Hackathon Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/30 to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">
                  FREE ENTRY
                </span>
                <span className="bg-magenta/20 text-magenta px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">
                  VIRTUAL
                </span>
              </div>
              <div className="absolute bottom-8 left-8">
                <h1 className="hero-title font-display text-5xl md:text-7xl font-bold text-white mb-2">
                  GL HACKATHON <span className="text-cyan">2026</span>
                </h1>
                <p className="hero-subtitle font-display text-2xl md:text-3xl text-text-secondary">
                  24 hours. One idea. ₹1,00,000 in prizes.
                </p>
                <p className="text-sm text-text-secondary/80 mt-3">
                  Exclusive to Great Learning learners • Developers & Data Analysts
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Card className="info-card bg-navy-secondary border-white/10 p-6 rounded-2xl card-shadow hover:border-cyan/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Date</p>
                  <p className="text-white font-semibold text-lg">Feb 15-16</p>
                </div>
              </div>
            </Card>
            <Card className="info-card bg-navy-secondary border-white/10 p-6 rounded-2xl card-shadow hover:border-cyan/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Team Spots</p>
                  <p className="text-white font-semibold text-lg">100 max</p>
                </div>
              </div>
            </Card>
            <Card className="info-card bg-navy-secondary border-white/10 p-6 rounded-2xl card-shadow hover:border-cyan/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-cyan" />
                </div>
                <div>
                  <p className="text-text-secondary text-sm">Prize Pool</p>
                  <p className="text-white font-semibold text-lg">₹1,00,000 INR</p>
                </div>
              </div>
            </Card>
            <div className="hero-cta">
              <Button
                onClick={() => navigate('/select-role')}
                className="w-full h-16 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-lg rounded-xl glow-cyan"
              >
                Register Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-center text-text-secondary/70 text-xs mt-2">
                Registration closes Feb 14 • Takes 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="min-h-screen py-20 px-6 lg:px-12 bg-navy-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="timeline-title font-display text-4xl md:text-5xl font-bold text-white mb-16">
            TIMELINE
          </h2>
          
          <div className="relative">
            {/* Timeline Track */}
            <div className="timeline-track absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan/50 via-cyan to-cyan/50 transform -translate-y-1/2 hidden md:block" />
            
            {/* Timeline Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { icon: CheckCircle, label: 'Register', date: 'Feb 1-14', status: 'completed', description: 'Sign up & form your team (free)' },
                { icon: Clock, label: 'Hack Starts', date: 'Feb 15, 9 AM IST', status: 'upcoming', description: 'Problem revealed, coding begins' },
                { icon: FileText, label: 'Submission', date: 'Feb 16, 9 AM IST', status: 'upcoming', description: 'Final deadline for all projects' },
                { icon: Trophy, label: 'Results', date: 'Feb 17, 6 PM IST', status: 'upcoming', description: 'Winners announced live' },
              ].map((node, index) => (
                <div key={index} className="timeline-node flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    node.status === 'completed' ? 'bg-cyan text-navy-primary' : 'bg-navy-primary border-2 border-cyan/50 text-cyan'
                  }`}>
                    <node.icon className="w-7 h-7" />
                  </div>
                  <Card className="bg-navy-primary border-white/10 p-5 rounded-2xl text-center w-full hover:border-cyan/30 transition-colors">
                    <p className="text-white font-semibold mb-1">{node.label}</p>
                    <p className="text-cyan text-sm font-mono mb-2">{node.date}</p>
                    <p className="text-text-secondary text-xs">{node.description}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section ref={prizesRef} className="min-h-screen py-20 px-6 lg:px-12 bg-navy-primary">
        <div className="max-w-7xl mx-auto">
          <h2 className="prizes-title font-display text-4xl md:text-5xl font-bold text-white text-center mb-4">
            PRIZES
          </h2>
          <p className="text-center text-text-secondary mb-12">
            Total Prize Pool: <span className="text-cyan font-semibold">₹1,00,000 INR</span>
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 items-end">
            {[
              { rank: '🥈 2nd', amount: '₹30,000', color: 'from-gray-400 to-gray-300', height: 'h-64' },
              { rank: '🥇 1st', amount: '₹50,000', color: 'from-yellow-400 to-yellow-300', featured: true, height: 'h-80' },
              { rank: '🥉 3rd', amount: '₹20,000', color: 'from-amber-600 to-amber-500', height: 'h-56' },
            ].map((prize, index) => (
              <Card 
                key={index} 
                className={`prize-card bg-navy-secondary border-white/10 rounded-3xl card-shadow overflow-hidden hover:border-cyan/30 transition-all ${
                  prize.featured ? 'md:scale-110 border-cyan/50' : ''
                }`}
              >
                <div className={`h-3 bg-gradient-to-r ${prize.color}`} />
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">{prize.rank}</div>
                  <div className={`font-display font-bold ${prize.featured ? 'text-5xl text-cyan' : 'text-4xl text-white'}`}>
                    {prize.amount}
                  </div>
                  <p className="text-text-secondary mt-4">Cash Prize</p>
                  {prize.featured && (
                    <div className="mt-4 inline-block px-3 py-1 bg-cyan/20 text-cyan text-xs rounded-full">
                      Grand Prize
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-text-secondary text-sm">
              All prizes disbursed via UPI / bank transfer within 7 days of results.
            </p>
            <p className="text-cyan/70 text-xs mt-2">
              + Certificates for all participants • Special recognition for top 10 teams
            </p>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section ref={rulesRef} className="min-h-screen py-20 px-6 lg:px-12 bg-navy-secondary">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="rules-title font-display text-4xl md:text-5xl font-bold text-white mb-10">
              RULES & <span className="text-cyan">GUIDELINES</span>
            </h2>
            
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div 
                  key={index} 
                  className="rule-item bg-navy-primary/50 border border-white/10 rounded-xl overflow-hidden hover:border-cyan/30 transition-colors"
                >
                  <button
                    onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 text-cyan flex-shrink-0" />
                      <span className="text-white">{rule.title}</span>
                    </div>
                    {expandedRule === index ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                  </button>
                  {expandedRule === index && (
                    <div className="px-4 pb-4 pl-13">
                      <p className="text-text-secondary text-sm ml-9">{rule.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 mt-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-cyan text-navy-primary hover:bg-cyan/90 font-semibold">
                    View Full Rules <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-navy-secondary border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white font-display text-2xl">Complete Rules & Guidelines</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-text-secondary">
                    <section>
                      <h3 className="text-white font-semibold mb-2">1. Eligibility</h3>
                      <p className="text-sm">Open to all students and professionals. Teams can have 2-4 members. Solo participants are allowed but can form teams later.</p>
                    </section>
                    <section>
                      <h3 className="text-white font-semibold mb-2">2. Project Requirements</h3>
                      <p className="text-sm">All code must be written during the hackathon. Use of open-source libraries is permitted. Projects must address the given problem statements.</p>
                    </section>
                    <section>
                      <h3 className="text-white font-semibold mb-2">3. Submission</h3>
                      <p className="text-sm">Submit via the portal before deadline. Include GitHub repo link, demo video, and project description.</p>
                    </section>
                    <section>
                      <h3 className="text-white font-semibold mb-2">4. Judging Criteria</h3>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        <li>Innovation (25%)</li>
                        <li>Execution (25%)</li>
                        <li>Presentation (20%)</li>
                        <li>Impact (20%)</li>
                        <li>Code Quality (10%)</li>
                      </ul>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => alert('PDF download would start here')}
              >
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Card className="bg-navy-primary border-white/10 rounded-3xl overflow-hidden card-shadow">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=1000&fit=crop" 
                alt="Team Meeting" 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-2">Ready to Hack?</h3>
                <p className="text-text-secondary text-sm mb-1">Join fellow Great Learning students in building something amazing.</p>
                <p className="text-cyan text-xs mb-4">No team? We'll match you with one!</p>
                <Button onClick={() => navigate('/select-role')} className="w-full bg-cyan text-navy-primary hover:bg-cyan/90">
                  Register Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6 lg:px-12 bg-navy-primary">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white text-center mb-12">
            FREQUENTLY ASKED <span className="text-cyan">QUESTIONS</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-navy-secondary border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-text-secondary text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-navy-primary border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-display text-2xl font-bold text-cyan tracking-wider mb-2">GL</div>
              <p className="text-white text-sm font-medium">Great Learning Hackathon</p>
              <p className="text-text-secondary text-xs mt-1">Organized by Great Learning</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => navigate('/select-role')} className="block text-text-secondary hover:text-cyan text-sm">Register</button>
                <button onClick={() => navigate('/problem')} className="block text-text-secondary hover:text-cyan text-sm">Problem Statement</button>
                <button onClick={() => navigate('/leaderboard')} className="block text-text-secondary hover:text-cyan text-sm">Leaderboard</button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <button onClick={() => alert('FAQ modal would open')} className="block text-text-secondary hover:text-cyan text-sm">FAQs</button>
                <button onClick={() => alert('Contact support modal would open')} className="block text-text-secondary hover:text-cyan text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" /> Contact Support
                </button>
                <button onClick={() => alert('Terms modal would open')} className="block text-text-secondary hover:text-cyan text-sm">Terms & Conditions</button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <button onClick={() => window.open('https://twitter.com', '_blank')} className="w-10 h-10 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button onClick={() => window.open('https://linkedin.com', '_blank')} className="w-10 h-10 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                  <ExternalLink className="w-5 h-5" />
                </button>
                <button onClick={() => window.open('https://discord.com', '_blank')} className="w-10 h-10 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-text-secondary text-sm">© 2026 GL Hackathon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
