import React, { useState, useEffect } from 'react';
import { Gamepad2, Sparkles, Trophy, Gift, RotateCcw, CheckCircle2, Award, Zap, HelpCircle, Plus, Trash2, X, PlusCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FrontpageGameProps {
  onRegisterClick?: () => void;
}

interface WheelSegment {
  id?: string;
  label: string;
  color: string;
  text: string;
  reward: string;
  isCustom?: boolean;
}

interface QuizItem {
  id?: string;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  isCustom?: boolean;
}

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { label: '₹50 Task Bonus', color: '#f59e0b', text: '#000000', reward: '₹50 Task Cash Bonus' },
  { label: '100 Coins', color: '#6366f1', text: '#ffffff', reward: '100 Reward Coins' },
  { label: '50 BV Boost', color: '#10b981', text: '#ffffff', reward: '50 Team BV Boost' },
  { label: '₹100 Voucher', color: '#ec4899', text: '#ffffff', reward: '₹100 Registration Voucher' },
  { label: '2x Matching', color: '#8b5cf6', text: '#ffffff', reward: '2x Dual-Leg Matching Boost' },
  { label: '250 Coins', color: '#3b82f6', text: '#ffffff', reward: '250 Reward Coins' },
  { label: 'Free VIP Pass', color: '#14b8a6', text: '#ffffff', reward: 'Free Leadership Conclave Pass' },
  { label: 'Lucky Bonus', color: '#ef4444', text: '#ffffff', reward: 'Surprise Cash Reward ₹25' },
];

const DEFAULT_QUIZ_QUESTIONS: QuizItem[] = [
  {
    id: 'quiz-1',
    q: 'What is the joining fee for Watch Video, Dream in Hand Direct Selling?',
    options: ['₹5,000 Package', '100% Free (Zero Joining Fee)', '₹1,500 Subscription', '₹10,000 Security'],
    correct: 1,
    explanation: 'As per Govt. 2021 Direct Selling Rules, joining is 100% free with no mandatory joining fees.',
  },
  {
    id: 'quiz-2',
    q: 'How many international and domestic luxury tours are fixed in the 18-Rank Plan?',
    options: ['5 Tours', '8 Tours', '13 Fixed Luxury Tours', '20 Tours'],
    correct: 2,
    explanation: 'There are 13 guaranteed fixed tours starting from Goa/Manali up to London and USA!',
  },
  {
    id: 'quiz-3',
    q: 'What is the maximum Nominee Family Safeguard social security monthly payout?',
    options: ['₹5,000/mo', '₹12,000/mo', '₹25,000/month', '₹50,000/mo'],
    correct: 2,
    explanation: 'Eligible rank leaders from Topaz to Rank 18 receive up to ₹25,000/month family safeguard.',
  },
];

export const FrontpageGame: React.FC<FrontpageGameProps> = ({ onRegisterClick }) => {
  const [activeTab, setActiveTab] = useState<'wheel' | 'quiz'>('wheel');

  // Wheel State
  const [spinning, setSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<string | null>(null);
  const [spinsLeft, setSpinsLeft] = useState<number>(3);
  const [totalCoins, setTotalCoins] = useState<number>(150);

  // Wheel Segments
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    try {
      const saved = localStorage.getItem('wv_game_segments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_SEGMENTS;
  });

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>(() => {
    try {
      const saved = localStorage.getItem('wv_game_quiz');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_QUIZ_QUESTIONS;
  });

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Modal State for adding questions / prizes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'quiz' | 'prize'>('quiz');

  // Form states for new quiz question
  const [newQuestion, setNewQuestion] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newOpt4, setNewOpt4] = useState('');
  const [newCorrect, setNewCorrect] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState('');

  // Form states for new wheel prize
  const [newPrizeLabel, setNewPrizeLabel] = useState('');
  const [newPrizeReward, setNewPrizeReward] = useState('');
  const [newPrizeColor, setNewPrizeColor] = useState('#10b981');

  useEffect(() => {
    try {
      localStorage.setItem('wv_game_quiz', JSON.stringify(quizQuestions));
    } catch {}
  }, [quizQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem('wv_game_segments', JSON.stringify(segments));
    } catch {}
  }, [segments]);

  const handleSpin = () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setWonPrize(null);

    // Calculate random segment
    const randomIndex = Math.floor(Math.random() * segments.length);
    const segmentDegree = 360 / segments.length;
    // Add 5 to 8 full rotations + target angle
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 3));
    const targetDegree = extraRotations + (360 - randomIndex * segmentDegree - segmentDegree / 2);

    const newRotation = wheelRotation + targetDegree;
    setWheelRotation(newRotation);

    setTimeout(() => {
      const prize = segments[randomIndex].reward;
      setWonPrize(prize);
      setSpinning(false);
      setSpinsLeft((prev) => prev - 1);
      setTotalCoins((prev) => prev + 100);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 4000);
  };

  const handleOptionSelect = (index: number) => {
    if (quizAnswered) return;
    setSelectedOption(index);
    setQuizAnswered(true);

    if (index === quizQuestions[currentQuizIndex].correct) {
      setQuizScore((prev) => prev + 1);
      setTotalCoins((prev) => prev + 50);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setQuizAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizFinished(false);
    setQuizScore(0);
  };

  const handleAddQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newOpt1.trim() || !newOpt2.trim()) return;

    const added: QuizItem = {
      id: `quiz-${Date.now()}`,
      q: newQuestion.trim(),
      options: [newOpt1.trim(), newOpt2.trim(), newOpt3.trim() || 'General Option C', newOpt4.trim() || 'General Option D'],
      correct: newCorrect,
      explanation: newExplanation.trim() || 'Verified direct selling company guideline.',
      isCustom: true,
    };

    setQuizQuestions((prev) => [...prev, added]);
    setIsModalOpen(false);
    setNewQuestion('');
    setNewOpt1('');
    setNewOpt2('');
    setNewOpt3('');
    setNewOpt4('');
    setNewExplanation('');

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  const handleAddWheelPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeLabel.trim() || !newPrizeReward.trim()) return;

    const added: WheelSegment = {
      id: `seg-${Date.now()}`,
      label: newPrizeLabel.trim(),
      color: newPrizeColor,
      text: '#ffffff',
      reward: newPrizeReward.trim(),
      isCustom: true,
    };

    setSegments((prev) => [...prev, added]);
    setIsModalOpen(false);
    setNewPrizeLabel('');
    setNewPrizeReward('');

    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <section id="game" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950 relative overflow-hidden">
      {/* Glow aura */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Interactive Distributor Games & Rewards</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Play & Win Real MLM Rewards, BV & Coins
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Test your luck on the Daily Lucky Spin Wheel or showcase your business acumen in the Direct Selling Challenge Quiz. Win instant vouchers and rank boosters!
          </p>

          {/* Tab Switcher & Customize Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                onClick={() => setActiveTab('wheel')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'wheel'
                    ? 'bg-amber-500 text-slate-950 shadow-lg font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lucky Spin Wheel</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'quiz'
                    ? 'bg-purple-600 text-white shadow-lg font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Direct Selling Quiz ({quizQuestions.length})</span>
              </button>
            </div>

            <button
              onClick={() => {
                setModalMode(activeTab === 'quiz' ? 'quiz' : 'prize');
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-bold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom {activeTab === 'quiz' ? 'Quiz Question' : 'Wheel Prize'}</span>
            </button>
          </div>
        </div>

        {/* Top Floating Coin Balance */}
        <div className="flex items-center justify-between max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Accumulated Game Reward Coins</p>
              <p className="text-lg font-black text-amber-400 font-mono">{totalCoins} Coins</p>
            </div>
          </div>

          <button
            onClick={onRegisterClick}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black transition shadow-md"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Redeem in ERP</span>
          </button>
        </div>

        {/* TAB 1: LUCKY SPIN WHEEL */}
        {activeTab === 'wheel' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Wheel Canvas Display */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 flex items-center justify-center">
                {/* Pointer indicator */}
                <div className="absolute -top-3 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />

                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(245,158,11,0.2)]" />

                {/* Rotating Wheel Container */}
                <div
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl relative transition-transform ease-out"
                  style={{
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionDuration: spinning ? '4s' : '0s',
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {segments.map((seg, i) => {
                      const totalSegments = segments.length;
                      const angle = 360 / totalSegments;
                      const startAngle = (i * angle * Math.PI) / 180;
                      const endAngle = ((i + 1) * angle * Math.PI) / 180;

                      const x1 = 50 + 50 * Math.cos(startAngle);
                      const y1 = 50 + 50 * Math.sin(startAngle);
                      const x2 = 50 + 50 * Math.cos(endAngle);
                      const y2 = 50 + 50 * Math.sin(endAngle);

                      const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                      const textAngle = i * angle + angle / 2;
                      const textRadius = 32;
                      const tx = 50 + textRadius * Math.cos((textAngle * Math.PI) / 180);
                      const ty = 50 + textRadius * Math.sin((textAngle * Math.PI) / 180);

                      return (
                        <g key={i}>
                          <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="0.5" />
                          <text
                            x={tx}
                            y={ty}
                            fill={seg.text}
                            fontSize="3.2"
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                          >
                            {seg.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Center Spin Button */}
                <button
                  onClick={handleSpin}
                  disabled={spinning || spinsLeft <= 0}
                  className="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-2xl border-4 border-slate-900 flex flex-col items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{spinning ? '...' : 'SPIN'}</span>
                </button>
              </div>
            </div>

            {/* Wheel Rewards & Stats Sidebar */}
            <div className="lg:col-span-5 space-y-5 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-white">Daily Spin & Win Wheel</h3>
                  <p className="text-xs text-slate-400">Prizes credited directly to ERP account</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                  {spinsLeft} Spins Left
                </span>
              </div>

              {/* Won Prize Notification */}
              {wonPrize && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-500/40 text-center space-y-2 animate-in zoom-in">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Congratulations!</span>
                  <h4 className="text-lg font-black text-white">{wonPrize}</h4>
                  <p className="text-xs text-emerald-400 font-bold">+100 Reward Coins added to balance!</p>
                </div>
              )}

              {/* Prize List Overview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Prizes on the Wheel</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {segments.slice(0, 6).map((seg, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-slate-300 truncate font-medium">{seg.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free daily 3 spins for every visitor and member</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% compliant with promotional reward guidelines</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT SELLING QUIZ */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            {!quizFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
                    <Award className="w-4 h-4" />
                    <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Score: {quizScore}/{quizQuestions.length}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {quizQuestions[currentQuizIndex].q}
                  </h3>

                  <div className="space-y-2.5">
                    {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === quizQuestions[currentQuizIndex].correct;
                      let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-purple-500/50';

                      if (quizAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 border-red-500/50 text-red-300';
                        } else {
                          btnStyle = 'opacity-50 border-slate-800';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          disabled={quizAnswered}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered && (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-1 animate-in fade-in">
                      <p className="font-bold">Did you know?</p>
                      <p>{quizQuestions[currentQuizIndex].explanation}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!quizAnswered}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-lg shadow-purple-600/20"
                  >
                    {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'Finish Quiz 🏆'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  🏆
                </div>
                <h3 className="text-xl font-black text-white">Quiz Completed!</h3>
                <p className="text-sm text-slate-300">
                  You scored <span className="text-emerald-400 font-bold font-mono">{quizScore} out of {quizQuestions.length}</span> correct answers and unlocked <span className="text-amber-400 font-bold font-mono">+{quizScore * 50} bonus coins</span>!
                </p>
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  <button
                    onClick={resetQuiz}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg"
                  >
                    Claim Reward & Join Free
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMIZE GAME MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative max-w-lg w-full bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Add Game Question or Prize</h3>
                    <p className="text-xs text-slate-400">Customize interactive learning & wheel prizes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode switch */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setModalMode('quiz')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    modalMode === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Add Quiz Question
                </button>
                <button
                  onClick={() => setModalMode('prize')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    modalMode === 'prize' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Add Wheel Prize
                </button>
              </div>

              {modalMode === 'quiz' ? (
                <form onSubmit={handleAddQuizQuestion} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Question Text</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. How many BV points are required for Rank 1 Star?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">4 Multiple Choice Options</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrect === 0}
                          onChange={() => setNewCorrect(0)}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option A"
                          value={newOpt1}
                          onChange={(e) => setNewOpt1(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrect === 1}
                          onChange={() => setNewCorrect(1)}
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option B"
                          value={newOpt2}
                          onChange={(e) => setNewOpt2(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrect === 2}
                          onChange={() => setNewCorrect(2)}
                        />
                        <input
                          type="text"
                          placeholder="Option C"
                          value={newOpt3}
                          onChange={(e) => setNewOpt3(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newCorrect === 3}
                          onChange={() => setNewCorrect(3)}
                        />
                        <input
                          type="text"
                          placeholder="Option D"
                          value={newOpt4}
                          onChange={(e) => setNewOpt4(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">Select the radio button beside the correct answer.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Explanation / Did You Know?</label>
                    <input
                      type="text"
                      placeholder="Brief explanation why this answer is correct..."
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg"
                    >
                      Save Question (প্রশ্ন যোগ করুন)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddWheelPrize} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Prize Wheel Short Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹500 Voucher"
                      value={newPrizeLabel}
                      onChange={(e) => setNewPrizeLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Detailed Reward Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹500 Shopping Voucher on Rank 1 Activation"
                      value={newPrizeReward}
                      onChange={(e) => setNewPrizeReward(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Segment Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={newPrizeColor}
                        onChange={(e) => setNewPrizeColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <span className="text-xs font-mono text-slate-400">{newPrizeColor}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg"
                    >
                      Save Prize (প্রাইজ যোগ করুন)
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
