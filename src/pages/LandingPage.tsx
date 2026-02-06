import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Users, Trophy, ArrowRight, CheckCircle, Clock, FileText, MessageCircle, Download, ChevronDown, ChevronUp, ExternalLink, Award, Zap, Briefcase } from 'lucide-react';
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
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([0, 1, 2]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo('.hero-subtitle',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo('.info-strip',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.25 }
      );
      gsap.fromTo('.hero-cta',
        { y: 15, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out', delay: 0.3 }
      );

      gsap.fromTo('.timeline-title',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, scrollTrigger: { trigger: timelineRef.current, start: 'top 85%', end: 'top 70%', scrub: 1 } }
      );
      gsap.fromTo('.timeline-step',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, scrollTrigger: { trigger: timelineRef.current, start: 'top 80%', end: 'top 55%', scrub: 1 } }
      );

      gsap.fromTo('.prizes-title',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, scrollTrigger: { trigger: prizesRef.current, start: 'top 85%', end: 'top 70%', scrub: 1 } }
      );
      gsap.fromTo('.prize-card',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, scrollTrigger: { trigger: prizesRef.current, start: 'top 80%', end: 'top 55%', scrub: 1 } }
      );

      gsap.fromTo('.rules-title',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, scrollTrigger: { trigger: rulesRef.current, start: 'top 85%', end: 'top 70%', scrub: 1 } }
      );
    });

    const handleScroll = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom || 0;
      setShowStickyBar(heroBottom < 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const rules = [
    { title: 'Who can participate', details: 'Open to all enrolled Great Learning students — developers, data analysts, and tech learners.' },
    { title: 'Team size: 2-4 members', details: 'Each team needs 2-4 members. No team? We\'ll match you with fellow learners.' },
    { title: 'Duration: 24 hours', details: 'Feb 15, 9 AM to Feb 16, 9 AM IST. All submissions must be made before deadline.' },
    { title: 'Original work only', details: 'All code must be created during the hackathon. Open-source libraries allowed.' },
    { title: 'Submit code + demo', details: 'Public GitHub repo with working demo (deployed app or video walkthrough).' },
    { title: 'Judging criteria', details: 'Innovation (25%), Execution (25%), Presentation (20%), Impact (20%), Code Quality (10%).' },
  ];

  const faqs = [
    { q: 'What if I don\'t have a team?', a: 'No problem! Register solo and we\'ll pair you with other learners before Feb 15.' },
    { q: 'Is there a registration fee?', a: 'No, participation is completely free for all Great Learning learners!' },
    { q: 'Who can participate?', a: 'This hackathon is exclusively for Great Learning enrolled students.' },
    { q: 'What tech stack can I use?', a: 'Use any language, framework, or tools you\'re comfortable with.' },
    { q: 'Do I need to be online for 24 hours?', a: 'Nope! Work at your own pace. Coordinate with your team. Just submit on time.' },
    { q: 'Can I work remotely?', a: 'Yes! This is a fully virtual hackathon. Participate from anywhere.' },
    { q: 'What happens if I miss the deadline?', a: 'Late submissions cannot be accepted. Set a reminder for Feb 16, 9 AM IST.' },
  ];

  const benefits = [
    { icon: Trophy, title: 'Win up to ₹50,000', description: 'Cash prizes for top 3 teams' },
    { icon: Award, title: 'Get certified', description: 'LinkedIn-shareable certificate for all' },
    { icon: Briefcase, title: 'Build your portfolio', description: 'Ship a real project in 24 hours' },
    { icon: Users, title: 'Network with peers', description: 'Connect with 100+ learners' },
  ];

  return (
    <div className="min-h-screen bg-navy-primary noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-primary/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 lg:px-12 py-3">
          <div className="font-display text-xl font-bold text-cyan tracking-wider cursor-pointer" onClick={() => navigate('/')}>GL</div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection(timelineRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Timeline</button>
            <button onClick={() => scrollToSection(prizesRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Prizes</button>
            <button onClick={() => scrollToSection(rulesRef)} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Rules</button>
            <button onClick={() => navigate('/problem')} className="text-text-secondary hover:text-cyan transition-colors text-sm font-medium">Problem</button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/select-role')} className="text-text-secondary hover:text-white text-sm h-9">Sign in</Button>
            <Button onClick={() => navigate('/select-role')} className="bg-cyan text-navy-primary hover:bg-cyan/90 font-semibold text-sm h-9">Register free</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Optimized for laptop (70-75vh) */}
      <section ref={heroRef} className="min-h-[72vh] pt-16 pb-8 flex flex-col items-center justify-center px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan/5 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-4xl mx-auto text-center relative z-10">
          {/* Badges - tighter spacing */}
          <div className="flex justify-center gap-2 mb-4">
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
              Free entry
            </span>
            <span className="bg-magenta/20 text-magenta px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
              Virtual event
            </span>
          </div>

          {/* Main headline - tighter line-height (1.1) */}
          <h1 className="hero-title font-display text-4xl md:text-6xl font-bold text-white mb-3 leading-[1.1]">
            Build something amazing in <span className="text-cyan">24 hours</span>
          </h1>

          {/* Subtitle - reduced margin */}
          <p className="hero-subtitle text-lg md:text-xl text-text-secondary mb-5 leading-relaxed max-w-2xl mx-auto">
            Join Great Learning's flagship hackathon. Compete for ₹1 lakh in prizes.
          </p>

          {/* Compact Info Strip - tighter gaps */}
          <div className="info-strip flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Calendar className="w-4 h-4 text-cyan" />
              <span>Feb 15-16, 2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock className="w-4 h-4 text-cyan" />
              <span>24 hours</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Users className="w-4 h-4 text-cyan" />
              <span>100 team spots</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Trophy className="w-4 h-4 text-cyan" />
              <span>₹1,00,000 prizes</span>
            </div>
          </div>

          {/* Primary CTA - pulled up */}
          <div className="hero-cta">
            <Button
              onClick={() => navigate('/select-role')}
              className="h-12 px-8 bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-base rounded-xl glow-cyan"
            >
              Register free — takes 2 minutes <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-text-secondary/70 text-sm mt-3">
              Registration closes Feb 14 • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Who Is This For - reduced padding */}
      <section className="py-10 px-6 lg:px-12 bg-navy-secondary/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-4">
            Who is this for?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-navy-primary/50 border border-white/10 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-cyan" />
              <span className="text-white text-sm">Great Learning students</span>
            </div>
            <div className="flex items-center gap-2 bg-navy-primary/50 border border-white/10 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-cyan" />
              <span className="text-white text-sm">Developers</span>
            </div>
            <div className="flex items-center gap-2 bg-navy-primary/50 border border-white/10 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-cyan" />
              <span className="text-white text-sm">Data analysts</span>
            </div>
            <div className="flex items-center gap-2 bg-navy-primary/50 border border-white/10 rounded-full px-4 py-2">
              <CheckCircle className="w-4 h-4 text-cyan" />
              <span className="text-white text-sm">Tech enthusiasts</span>
            </div>
          </div>
          <p className="text-text-secondary text-sm mt-4">
            First-time hackers welcome — all skill levels can participate and win!
          </p>
        </div>
      </section>

      {/* Timeline Section - compressed spacing */}
      <section ref={timelineRef} className="py-12 px-6 lg:px-12 bg-navy-primary">
        <div className="max-w-5xl mx-auto">
          <h2 className="timeline-title font-display text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            How it works
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Register', date: 'By Feb 14', icon: CheckCircle },
              { label: 'Hack', date: 'Feb 15, 9 AM', icon: Zap },
              { label: 'Submit', date: 'Feb 16, 9 AM', icon: FileText },
              { label: 'Win', date: 'Feb 17', icon: Trophy },
            ].map((node, index) => (
              <div key={index} className="timeline-step flex flex-col items-center text-center relative">
                {/* Connecting line - only between nodes on desktop */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-cyan to-cyan/30" />
                )}
                <div className="w-12 h-12 rounded-full bg-navy-primary border-2 border-cyan flex items-center justify-center mb-2 relative z-10">
                  <node.icon className="w-5 h-5 text-cyan" />
                </div>
                <p className="text-white font-semibold text-base mb-0.5">{node.label}</p>
                <p className="text-cyan text-sm font-mono">{node.date}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-text-secondary/60 text-xs mt-6">All times in IST (Indian Standard Time)</p>
        </div>
      </section>

      {/* What You'll Get - reduced card padding */}
      <section className="py-12 px-6 lg:px-12 bg-navy-secondary">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            What you'll get
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-navy-primary/50 border-white/10 p-4 rounded-xl text-center hover:border-cyan/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center mx-auto mb-3">
                  <benefit.icon className="w-5 h-5 text-cyan" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{benefit.title}</h3>
                <p className="text-text-secondary text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section - reduced padding, smaller title */}
      <section ref={prizesRef} className="py-12 px-6 lg:px-12 bg-navy-primary">
        <div className="max-w-5xl mx-auto">
          <h2 className="prizes-title font-display text-2xl md:text-3xl font-bold text-white text-center mb-2">
            Your code could win you ₹50,000
          </h2>
          <p className="text-center text-text-secondary text-sm mb-8">
            Total prize pool: <span className="text-cyan font-semibold">₹1,00,000</span>
          </p>

          <div className="grid md:grid-cols-3 gap-4 items-end">
            {[
              { rank: '1st', amount: '₹50,000', color: 'from-yellow-400 to-yellow-300', featured: true },
              { rank: '2nd', amount: '₹30,000', color: 'from-gray-400 to-gray-300' },
              { rank: '3rd', amount: '₹20,000', color: 'from-amber-600 to-amber-500' },
            ].map((prize, index) => (
              <Card
                key={index}
                className={`prize-card bg-navy-secondary border-white/10 rounded-xl overflow-hidden hover:border-cyan/30 transition-all ${
                  prize.featured ? 'md:scale-105 border-cyan/50' : ''
                }`}
              >
                <div className={`h-1.5 bg-gradient-to-r ${prize.color}`} />
                <div className="p-4 text-center">
                  <div className="text-2xl mb-1">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                  <div className="text-xs text-text-secondary mb-1">{prize.rank} place</div>
                  <div className={`font-display font-bold ${prize.featured ? 'text-3xl text-cyan' : 'text-2xl text-white'}`}>
                    {prize.amount}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-center text-cyan/70 text-sm mt-6">
            + Certificates for all participants • Special recognition for top 10 teams
          </p>
        </div>
      </section>

      {/* Rules Section - reduced row height */}
      <section ref={rulesRef} className="py-12 px-6 lg:px-12 bg-navy-secondary">
        <div className="max-w-3xl mx-auto">
          <h2 className="rules-title font-display text-2xl md:text-3xl font-bold text-white mb-2 text-center">
            Rules
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6">
            Simple and fair — designed for first-time hackers too
          </p>

          <div className="space-y-1.5">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="bg-navy-primary/50 border border-white/10 rounded-lg overflow-hidden hover:border-cyan/30 transition-colors"
              >
                <button
                  onClick={() => setExpandedRule(expandedRule === index ? null : index)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan flex-shrink-0" />
                    <span className="text-white text-sm">{rule.title}</span>
                  </div>
                  {expandedRule === index ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                </button>
                {expandedRule === index && (
                  <div className="px-3 pb-3 pl-9">
                    <p className="text-text-secondary text-sm leading-relaxed">{rule.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm h-9">
                  Read full rules
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-navy-secondary border-white/10 max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white font-display text-xl">Complete rules and guidelines</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-text-secondary">
                  <section>
                    <h3 className="text-white font-semibold mb-1 text-sm">1. Eligibility</h3>
                    <p className="text-sm leading-relaxed">Open to all students and professionals. Teams can have 2-4 members. Solo participants are allowed but can form teams later.</p>
                  </section>
                  <section>
                    <h3 className="text-white font-semibold mb-1 text-sm">2. Project requirements</h3>
                    <p className="text-sm leading-relaxed">All code must be written during the hackathon. Use of open-source libraries is permitted. Projects must address the given problem statements.</p>
                  </section>
                  <section>
                    <h3 className="text-white font-semibold mb-1 text-sm">3. Submission</h3>
                    <p className="text-sm leading-relaxed">Submit via the portal before deadline. Include GitHub repo link, demo video, and project description.</p>
                  </section>
                  <section>
                    <h3 className="text-white font-semibold mb-1 text-sm">4. Judging criteria</h3>
                    <ul className="text-sm list-disc list-inside space-y-0.5">
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
              className="border-white/20 text-white hover:bg-white/10 text-sm h-9"
              onClick={() => alert('PDF download would start here')}
            >
              <Download className="w-4 h-4 mr-1.5" /> Download PDF
            </Button>
          </div>
        </div>
      </section>

      {/* FAQs Section - 2 column layout for laptop, reduced padding */}
      <section className="py-12 px-6 lg:px-12 bg-navy-primary">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-6">
            Frequently asked questions
          </h2>

          <div className="grid md:grid-cols-2 gap-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-navy-secondary border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <span className="text-white text-sm font-medium pr-2">{faq.q}</span>
                  {expandedFaqs.includes(index) ? (
                    <ChevronUp className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />
                  )}
                </button>
                {expandedFaqs.includes(index) && (
                  <div className="px-3 pb-3">
                    <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="flex flex-col items-center mt-10">
            <p className="text-text-secondary text-sm mb-3">Ready to build something amazing?</p>
            <Button
              onClick={() => navigate('/select-role')}
              className="bg-cyan text-navy-primary hover:bg-cyan/90 font-display font-bold text-base px-6 py-5 rounded-xl glow-cyan"
            >
              Register free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-text-secondary/60 text-xs mt-2">No credit card required • Takes 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer - reduced padding */}
      <footer className="py-8 px-6 lg:px-12 bg-navy-primary border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="font-display text-xl font-bold text-cyan tracking-wider mb-1">GL</div>
              <p className="text-white text-sm font-medium">Great Learning Hackathon</p>
              <p className="text-text-secondary text-xs mt-1">Organized by Great Learning</p>
              <p className="text-cyan/60 text-xs mt-0.5">Trusted by 10,000+ learners</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick links</h4>
              <div className="space-y-1.5">
                <button onClick={() => navigate('/select-role')} className="block text-text-secondary hover:text-cyan text-sm">Register free</button>
                <button onClick={() => navigate('/problem')} className="block text-text-secondary hover:text-cyan text-sm">Problem statement</button>
                <button onClick={() => navigate('/leaderboard')} className="block text-text-secondary hover:text-cyan text-sm">Leaderboard</button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <div className="space-y-1.5">
                <button onClick={() => alert('FAQ modal would open')} className="block text-text-secondary hover:text-cyan text-sm">FAQs</button>
                <button onClick={() => alert('Contact support modal would open')} className="block text-white hover:text-cyan text-sm font-medium flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Contact support
                </button>
                <p className="text-text-secondary/60 text-xs">Response within 24 hours</p>
                <button onClick={() => alert('Terms modal would open')} className="block text-text-secondary hover:text-cyan text-sm">Terms and conditions</button>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Connect</h4>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <button onClick={() => window.open('https://twitter.com', '_blank')} aria-label="Twitter" title="Twitter" className="w-9 h-9 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary/60 mt-0.5">Twitter</span>
                </div>
                <div className="flex flex-col items-center">
                  <button onClick={() => window.open('https://linkedin.com', '_blank')} aria-label="LinkedIn" title="LinkedIn" className="w-9 h-9 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary/60 mt-0.5">LinkedIn</span>
                </div>
                <div className="flex flex-col items-center">
                  <button onClick={() => window.open('https://discord.com', '_blank')} aria-label="Discord" title="Discord" className="w-9 h-9 rounded-lg bg-navy-secondary flex items-center justify-center text-text-secondary hover:text-cyan hover:border-cyan/50 border border-transparent transition-all">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-text-secondary/60 mt-0.5">Discord</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 text-center">
            <p className="text-text-secondary text-xs">© 2026 GL Hackathon. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom CTA Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-navy-primary/95 backdrop-blur-md border-t border-white/10 py-2.5 px-6 transition-transform duration-300 ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-white font-medium text-sm">GL Hackathon 2026</p>
            <p className="text-text-secondary text-xs">Feb 15-16 • ₹1,00,000 in prizes</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <span className="text-yellow-500/80 text-xs hidden md:block">Registration closes Feb 14</span>
            <Button
              onClick={() => navigate('/select-role')}
              className="bg-cyan text-navy-primary hover:bg-cyan/90 font-semibold text-sm px-5 h-9"
            >
              Register free <ArrowRight className="ml-1.5 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
