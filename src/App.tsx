import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Pause,
  Play,
  Sparkles,
  X,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

// Target Birthday Date: 14 August 2026
const BIRTHDAY_TIME = new Date("August 14, 2026 00:00:00").getTime();

interface PolaroidCard {
  id: number;
  image: string;
  caption: string;
  heartType: 'heart' | 'star' | 'flower';
  title: string;
  text: string;
  flipped: boolean;
}

type TabType = 'welcome' | 'letter' | 'polaroid' | 'coupons' | 'wish';

const TAB_ORDER: TabType[] = ['welcome', 'letter', 'polaroid', 'coupons', 'wish'];

export default function App() {
  // --- States ---
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSimulatorOn, setIsSimulatorOn] = useState(() => {
    return localStorage.getItem('birthday_sim_on') === 'true';
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('welcome');
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');

  const navigateToTab = (targetTab: TabType) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const targetIndex = TAB_ORDER.indexOf(targetTab);
    const direction = targetIndex >= currentIndex ? 'next' : 'prev';
    setSlideDirection(direction);
    setActiveTab(targetTab);
  };

  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [isLetterFocused, setIsLetterFocused] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const [polaroids, setPolaroids] = useState<PolaroidCard[]>([
    {
      id: 1,
      image: '/assets/foto1.jpg',
      caption: 'Senyum Favoritku 😊',
      heartType: 'heart',
      title: 'Tawamu & Senyummu',
      text: 'Hal pertama yang selalu berhasil mencerahkan hari buruk mamas adalah melihat senyuman manis dari bibirmu. Jangan pernah bosan tersenyum ya, Cantik!',
      flipped: false
    },
    {
      id: 2,
      image: '/assets/foto2.jpg',
      caption: 'Sosok Hebatku 🌟',
      heartType: 'star',
      title: 'Kerja Kerasmu',
      text: 'Aku selalu kagum dengan caramu berjuang, belajar, dan selalu berusaha memberikan yang terbaik untuk semua hal yang kamu lakukan. Kamu sangat luar biasa baby!',
      flipped: false
    },
    {
      id: 3,
      image: '/assets/foto3.jpg',
      caption: 'Kehangatan Hatimu 🥰',
      heartType: 'flower',
      title: 'Kepedulianmu',
      text: 'Sifat penyayang dan cara kamu memperlakukan mamas dengan penuh kesabaran adalah hadiah terbaik yang pernah mamas terima. Makasih ya baby.',
      flipped: false
    }
  ]);

  const [coupons, setCoupons] = useState([
    {
      id: 1,
      decor: '🎟️',
      title: 'KUPON TRAKTIR MIXUE',
      desc: 'Bisa ditukarkan kapan saja saat kamu lagi pengen yang manis-manis.',
      code: 'ICE-CREAM-SWEET20',
      claimed: false
    },
    {
      id: 2,
      decor: '🍿',
      title: 'KUPON TEMENIN JALAN-JALAN',
      desc: 'Bebas pilih tempat pacaran/jalan-jalan kapanpun itu ya cantik.',
      code: 'DATE-GOLDEN',
      claimed: false
    },
    {
      id: 3,
      decor: '🧸',
      title: 'KUPON DI PELUK BERUANG',
      desc: 'Bisa ditukarkan kapan saja saat kamu lagi pengen dipeluk sama pacarmu yang paling ganteng ini.',
      code: 'BEAR-HUG',
      claimed: false
    }
  ]);

  const [isCandleBlown, setIsCandleBlown] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Effects ---

  // 1. Audio Auto-Play immediately on load + interaction fallback
  useEffect(() => {
    const attemptPlay = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsMusicPlaying(true))
          .catch(e => {
            console.log('Direct autoplay blocked by browser policy, awaiting user gesture:', e);
          });
      }
    };

    // Attempt autoplay immediately when website loads
    attemptPlay();

    // Fallback for strict browser autoplay policies: trigger on any first user gesture
    const events = ['click', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true);
            events.forEach(event => window.removeEventListener(event, handleInteraction));
          })
          .catch(e => console.log('Play on gesture failed:', e));
      }
    };

    events.forEach(event => window.addEventListener(event, handleInteraction, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleInteraction));
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Toggle Audio
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsMusicPlaying(true))
          .catch(e => console.log('Play failed:', e));
      }
    }
  };

  // 2. Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (isSimulatorOn) {
        setIsUnlocked(true);
        return;
      }

      const now = new Date().getTime();
      const distance = BIRTHDAY_TIME - now;

      if (distance <= 0) {
        setIsUnlocked(true);
        clearInterval(timer);
      } else {
        setIsUnlocked(false);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(days).padStart(2, '0'),
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0')
        });
      }
    }, 1000);

    // Initial check
    if (isSimulatorOn) {
      setIsUnlocked(true);
    } else {
      const now = new Date().getTime();
      if (BIRTHDAY_TIME - now <= 0) {
        setIsUnlocked(true);
      }
    }

    return () => clearInterval(timer);
  }, [isSimulatorOn]);

  // 3. Particles background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      opacity: number;
      type: 'heart' | 'circle';
    }> = [];

    const colors = ['#f43f5e', '#fda4af', '#fecdd3', '#ffe4e6', '#be123c', '#d4af37'];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const particleCount = Math.min(Math.floor(canvas.width / 15), 70);

    // Initialize
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        size: Math.random() * 12 + 4,
        speedY: -(Math.random() * 1.5 + 0.5),
        speedX: Math.sin(Math.random() * 2) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.3,
        type: Math.random() > 0.5 ? 'heart' : 'circle'
      });
    }

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, d: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + d / 4);
      ctx.quadraticCurveTo(x, y, x + d / 2, y);
      ctx.quadraticCurveTo(x + d, y, x + d, y + d / 3);
      ctx.quadraticCurveTo(x + d, y + (d * 2) / 3, x + d / 2, y + d);
      ctx.quadraticCurveTo(x, y + (d * 2) / 3, x, y + d / 3);
      ctx.quadraticCurveTo(x, y, x, y + d / 4);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Update position
        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity -= 0.0005;

        // Reset if offscreen
        if (p.y < -20 || p.opacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 50;
          p.opacity = Math.random() * 0.5 + 0.3;
          p.speedY = -(Math.random() * 1.5 + 0.5);
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Interactions ---

  // Simulator Toggle
  const toggleSimulator = () => {
    const nextVal = !isSimulatorOn;
    setIsSimulatorOn(nextVal);
    localStorage.setItem('birthday_sim_on', String(nextVal));
    if (nextVal) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
  };

  // Open envelope
  const handleEnvelopeClick = () => {
    if (!isEnvelopeOpen) {
      setIsEnvelopeOpen(true);
      confetti({ particleCount: 40, spread: 80, origin: { y: 0.6 } });
    } else {
      setIsLetterFocused(true);
    }
  };

  // Flip polaroid
  const handlePolaroidClick = (id: number) => {
    setPolaroids(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, flipped: !p.flipped };
      }
      return p;
    }));
  };

  // Claim coupon
  const handleClaimCoupon = (id: number) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id && !c.claimed) {
        confetti({ particleCount: 30, spread: 50, colors: ['#ea580c', '#f59e0b', '#fda4af'] });
        return { ...c, claimed: true };
      }
      return c;
    }));
  };

  // Blow candle
  const handleBlowCandle = () => {
    if (isCandleBlown) return;

    setShowSmoke(true);
    setTimeout(() => {
      setShowSmoke(false);
      setIsCandleBlown(true);

      // Massive confetti spray
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }, 1000);
  };

  return (
    // Replaced relative min-h-screen with flex layout to push footer strictly to bottom
    <div className="relative min-h-screen flex flex-col justify-between select-none">

      {/* Background Particles Canvas (Fixed overlay) */}
      <canvas ref={canvasRef} id="particles-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />

      {/* Floating Audio Player (Fixed bottom-6 left-6) */}
      <div
        id="audio-player-container"
        className="fixed bottom-6 left-6 z-[100] glass-card flex items-center gap-4 py-2.5 px-4 rounded-full max-w-[320px] shadow-lg pointer-events-auto hover:translate-y-[-4px] hover:bg-white/60 transition-all duration-300"
      >
        <div className="relative">
          <div className={`music-disc w-9 h-9 bg-neutral-900 rounded-full flex items-center justify-center text-sm shadow-md animate-spin-slow ${isMusicPlaying ? '' : '[animation-play-state:paused]'}`}>
            🎵
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="song-title text-[11px] font-semibold text-burgundy-900 max-w-[110px] truncate" title="Jamrud - Selamat Ulang Tahun">
            Jamrud - Ultah.mp3
          </span>
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3 h-3 text-burgundy-700" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 h-1 bg-rose-gold-300 rounded-lg appearance-none cursor-pointer accent-rose-gold-600"
            />
          </div>
        </div>
        <button
          onClick={togglePlay}
          className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Play or pause music"
        >
          {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>
        <audio ref={audioRef} autoPlay loop src="/assets/Selamat Ulang Tahun [Jamrud].mp3"></audio>
      </div>

      {/* 
        MAIN CONTENT CONTAINER (Centered vertically inside the screen)
        Uses flex-grow to occupy all vertical space, keeping elements centered.
      */}
      <main className="relative z-10 flex-grow flex items-center justify-center w-full max-w-5xl mx-auto px-4 py-8">

        {/* ==========================================
           1. COUNTDOWN SECTION
           ========================================== */}
        {!isUnlocked && (
          <section className="flex flex-col items-center justify-center w-full animate-pop">
            <div className="countdown-container glass-card text-center p-8 md:p-12 max-w-xl w-full">
              <h2 className="pre-title text-xs md:text-sm tracking-[3px] uppercase font-semibold text-burgundy-700 mb-2">
                Menghitung Hari Menuju Ulang Tahun ke-20
              </h2>
              <h1 className="main-love-title font-heading text-4xl md:text-5xl font-bold text-rose-gold-700 mb-8 drop-shadow-sm">
                My Special One
              </h1>

              <div className="timer-grid grid grid-cols-4 gap-3 md:gap-4 mb-8">
                <div className="timer-box bg-white/50 border border-white/40 rounded-2xl py-4 px-2 shadow-sm">
                  <span className="timer-num font-heading text-3xl md:text-4xl font-bold text-rose-gold-600 block">
                    {timeLeft.days}
                  </span>
                  <span className="timer-label text-[10px] md:text-xs tracking-wider uppercase font-semibold text-burgundy-700">
                    Hari
                  </span>
                </div>
                <div className="timer-box bg-white/50 border border-white/40 rounded-2xl py-4 px-2 shadow-sm">
                  <span className="timer-num font-heading text-3xl md:text-4xl font-bold text-rose-gold-600 block">
                    {timeLeft.hours}
                  </span>
                  <span className="timer-label text-[10px] md:text-xs tracking-wider uppercase font-semibold text-burgundy-700">
                    Jam
                  </span>
                </div>
                <div className="timer-box bg-white/50 border border-white/40 rounded-2xl py-4 px-2 shadow-sm">
                  <span className="timer-num font-heading text-3xl md:text-4xl font-bold text-rose-gold-600 block">
                    {timeLeft.minutes}
                  </span>
                  <span className="timer-label text-[10px] md:text-xs tracking-wider uppercase font-semibold text-burgundy-700">
                    Menit
                  </span>
                </div>
                <div className="timer-box bg-white/50 border border-white/40 rounded-2xl py-4 px-2 shadow-sm">
                  <span className="timer-num font-heading text-3xl md:text-4xl font-bold text-rose-gold-600 block">
                    {timeLeft.seconds}
                  </span>
                  <span className="timer-label text-[10px] md:text-xs tracking-wider uppercase font-semibold text-burgundy-700">
                    Detik
                  </span>
                </div>
              </div>

              <p className="countdown-note italic text-burgundy-700 text-sm">
                Sesuatu yang spesial sedang menantimu di tanggal 14 Agustus nanti... ✨
              </p>
            </div>
          </section>
        )}

        {/* ==========================================
           2. SURPRISE CONTENT (GUIDED FLOW WITH SLIDE ANIMATIONS)
           ========================================== */}
        {isUnlocked && (
          <div className="w-full flex flex-col items-center justify-center animate-pop-in">

            {/* Guided tab renders with dynamic slide transition */}
            <div className="w-full flex flex-col justify-center items-center">

              {/* SUB-PAGE 1: WELCOME / HOME */}
              {activeTab === 'welcome' && (
                <div key="welcome" className={`w-full flex flex-col justify-center items-center ${slideDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                  <div className="welcome-header glass-card text-center py-12 px-6 md:py-16 md:px-12 max-w-2xl w-full flex flex-col items-center shadow-lg border border-white/50">
                    <span className="badge bg-rose-gold-300 text-rose-gold-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase inline-block mb-6 shadow-sm">
                      14 Agustus
                    </span>
                    <h1 className="birthday-title font-heading text-3xl md:text-5xl font-bold text-rose-gold-700 mb-6 tracking-wide leading-tight">
                      Happy 20th Birthday, Baby! 🎉
                    </h1>
                    <p className="birthday-subtitle text-burgundy-700 text-sm md:text-base leading-relaxed max-w-lg mx-auto font-medium mb-8">
                      Selamat memasuki usia kepala dua. Hariku selalu lebih indah dan penuh warna sejak ada kamu di samping mamas.
                    </p>

                    {/* Guided Navigation Button */}
                    <button
                      onClick={() => {
                        confetti({ particleCount: 15, spread: 40 });
                        navigateToTab('letter');
                      }}
                      className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold py-3.5 px-8 rounded-full text-xs md:text-sm shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
                    >
                      Buka Kejutan <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PAGE 2: LOVE LETTER */}
              {activeTab === 'letter' && (
                <div key="letter" className={`envelope-wrapper flex flex-col items-center w-full max-w-md ${slideDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                  <h2 className="section-title font-heading text-2xl md:text-3xl text-rose-gold-700 font-bold text-center mb-2">
                    Ada Surat Spesial Untukmu... 💌
                  </h2>
                  <p className="instruction-text text-xs md:text-sm text-burgundy-700 italic text-center mb-8">
                    Klik amplop di bawah ini untuk membukanya
                  </p>

                  <div
                    onClick={handleEnvelopeClick}
                    className={`envelope-container relative w-72 h-48 md:w-80 md:h-52 bg-white rounded-b-md shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-1.5 ${isEnvelopeOpen ? 'open' : ''}`}
                  >
                    <div className="absolute inset-0 bg-rose-gold-300 rounded-md z-1"></div>

                    {/* Letter inside preview */}
                    <div
                      className={`absolute bottom-3 left-3 right-3 bg-[#fffdfb] border border-rose-gold-100 shadow-sm p-4 rounded-lg z-2 overflow-hidden transition-all duration-500 flex flex-col gap-1.5
                        ${isEnvelopeOpen ? 'h-36 md:h-40 -translate-y-24 md:-translate-y-28 scale-100 z-5' : 'h-32 md:h-36 scale-95 z-2'}
                      `}
                    >
                      <span className="text-[9px] text-burgundy-700 self-end font-semibold">14 Agustus 2026</span>
                      <h3 className="font-heading font-bold text-xs text-rose-gold-700 flex items-center gap-1">
                        Halo Baby, <Heart className="w-3 h-3 fill-rose-gold-500 text-rose-gold-500" />
                      </h3>
                      <p className="text-[10px] text-burgundy-900 leading-relaxed text-justify line-clamp-3 md:line-clamp-4">
                        Selamat ulang tahun yang ke-20 ya babyyy! Hari ini adalah hari yang sangat-sangat spesial, tidak hanya untuk kamu, tapi juga untuk mamas 
                        karena mamas bisa merayakan hari kelahiran orang yang...
                      </p>
                      <span className="text-[9px] text-right text-burgundy-700 font-medium">Klik untuk perbesar...</span>
                    </div>

                    <div className="absolute inset-0 z-3 border-l-[144px] md:border-l-[160px] border-l-rose-200 border-r-[144px] md:border-r-[160px] border-r-rose-200 border-b-[96px] md:border-b-[104px] border-b-rose-100 border-t-[96px] md:border-t-[104px] border-t-transparent rounded-b-md"></div>

                    <div
                      className={`absolute top-0 left-0 w-0 h-0 border-l-[144px] md:border-l-[160px] border-l-transparent border-r-[144px] md:border-r-[160px] border-r-transparent border-t-[104px] md:border-t-[112px] border-t-rose-300 transform-origin-top transition-all duration-400 ease-in-out z-4
                        ${isEnvelopeOpen ? 'rotate-x-180 z-1' : 'rotate-x-0 z-4'}
                      `}
                      style={{
                        transformOrigin: 'top',
                        transform: isEnvelopeOpen ? 'rotateX(180deg)' : 'rotateX(0deg)'
                      }}
                    ></div>
                  </div>

                  {/* Guided Navigation Button Group */}
                  <div className="flex gap-4 mt-12 w-full justify-center">
                    <button
                      onClick={() => navigateToTab('welcome')}
                      className="bg-burgundy-900/10 hover:bg-burgundy-900/20 text-burgundy-900 font-bold py-2.5 px-6 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                    <button
                      onClick={() => navigateToTab('polaroid')}
                      className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      Lihat Foto-Foto <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PAGE 3: POLAROID GALLERY */}
              {activeTab === 'polaroid' && (
                <div key="polaroid" className={`polaroid-section flex flex-col items-center gap-8 w-full max-w-5xl ${slideDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                  <div className="text-center">
                    <h2 className="section-title font-heading text-2xl md:text-3xl text-rose-gold-700 font-bold mb-2">
                      Alasan Kenapa Kamu Begitu Spesial ✨
                    </h2>
                    <p className="instruction-text text-xs md:text-sm text-burgundy-700 italic">
                      Klik fotonya untuk melihat pesan rahasia di belakangnya!
                    </p>
                  </div>

                  <div className="polaroid-grid grid grid-cols-1 md:grid-cols-3 gap-8 px-4 w-full justify-center">
                    {polaroids.map((card, idx) => (
                      <div
                        key={card.id}
                        onClick={() => handlePolaroidClick(card.id)}
                        className="polaroid-card h-[380px] w-full max-w-[280px] mx-auto perspective-1000 cursor-pointer group"
                        style={{
                          transform: !card.flipped && window.innerWidth > 768
                            ? `rotate(${idx === 0 ? -3 : idx === 1 ? 2 : -1}deg) translateY(${idx === 1 ? -6 : 0}px)`
                            : 'none'
                        }}
                      >
                        <div
                          className="card-inner relative w-full h-full transform-style-3d transition-transform duration-700 ease-out"
                          style={{
                            transform: card.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}
                        >
                          {/* Front Side */}
                          <div
                            className="card-front absolute inset-0 bg-white p-3.5 pb-5 shadow-md border border-neutral-100 rounded-sm flex flex-col backface-hidden"
                            style={{ transform: 'rotateY(0deg) translateZ(1px)' }}
                          >
                            <div className="photo-placeholder w-full h-[270px] bg-[#fdf5f6] border border-neutral-50 overflow-hidden rounded-sm flex items-center justify-center">
                              <img
                                src={card.image}
                                alt={card.caption}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="polaroid-caption font-handwriting text-2xl text-center mt-3 text-burgundy-900 leading-tight">
                              {card.caption}
                            </div>
                          </div>

                          {/* Back Side */}
                          <div
                            className="card-back absolute inset-0 bg-[#fffdfb] border border-rose-gold-200 shadow-md p-5 rounded-2xl flex items-center justify-center backface-hidden"
                            style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                          >
                            <div className="text-center flex flex-col items-center">
                              <span className="heart-icon text-2.5xl block mb-3 animate-beat">
                                {card.heartType === 'heart' && '❤️'}
                                {card.heartType === 'star' && '⭐'}
                                {card.heartType === 'flower' && '🌸'}
                              </span>
                              <h3 className="font-heading text-base font-bold text-rose-gold-700 mb-2">
                                {card.title}
                              </h3>
                              <p className="text-burgundy-900 text-xs leading-relaxed text-justify px-2">
                                {card.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Guided Navigation Button Group */}
                  <div className="flex gap-4 mt-8 w-full justify-center">
                    <button
                      onClick={() => navigateToTab('letter')}
                      className="bg-burgundy-900/10 hover:bg-burgundy-900/20 text-burgundy-900 font-bold py-2.5 px-6 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                    <button
                      onClick={() => navigateToTab('coupons')}
                      className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      Buka Hadiah <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PAGE 4: COUPONS */}
              {activeTab === 'coupons' && (
                <div key="coupons" className={`coupons-section flex flex-col items-center gap-8 w-full max-w-4xl ${slideDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                  <div className="text-center">
                    <h2 className="section-title font-heading text-2xl md:text-3xl text-rose-gold-700 font-bold mb-2">
                      Kupon Cinta Virtual Spesial 🎟️
                    </h2>
                    <p className="instruction-text text-xs md:text-sm text-burgundy-700 italic">
                      Klik kupon di bawah ini untuk mengklaim kado kejutan dariku!
                    </p>
                  </div>

                  <div className="coupons-grid grid grid-cols-1 md:grid-cols-3 gap-6 px-4 w-full">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        onClick={() => handleClaimCoupon(coupon.id)}
                        className={`coupon-item glass-card flex items-center p-5 rounded-2xl border-2 border-dashed border-rose-gold-300 relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:bg-white/65 hover:shadow-md transition-all duration-300
                          ${coupon.claimed ? 'claimed bg-amber-50/50 border-gold-accent hover:bg-amber-50/50 shadow-inner' : ''}
                        `}
                      >
                        <div className="coupon-decor text-4xl mr-4 drop-shadow-sm select-none transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          {coupon.decor}
                        </div>
                        <div className="coupon-info flex-1">
                          <h3 className="coupon-title text-[13px] font-bold text-rose-gold-700 mb-1 tracking-wide">
                            {coupon.title}
                          </h3>
                          <p className="coupon-desc text-[11px] text-burgundy-700 mb-2 leading-relaxed">
                            {coupon.desc}
                          </p>
                          <span className={`coupon-status text-[10px] font-bold uppercase tracking-wider ${coupon.claimed ? 'text-gold-accent-dark' : 'text-rose-gold-500'}`}>
                            {coupon.claimed ? (
                              <span>KODE: <strong>{coupon.code}</strong></span>
                            ) : 'Ketuk untuk klaim'}
                          </span>
                        </div>

                        {/* Claimed Stamp overlay */}
                        {coupon.claimed && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-amber-50/15">
                            <div className="font-bold text-[28px] text-gold-accent/25 border-4 border-double border-gold-accent/25 px-4 py-1 rounded-lg tracking-[4px] -rotate-12 animate-stamp-in select-none">
                              DIKLAIM
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Guided Navigation Button Group */}
                  <div className="flex gap-4 mt-8 w-full justify-center">
                    <button
                      onClick={() => navigateToTab('polaroid')}
                      className="bg-burgundy-900/10 hover:bg-burgundy-900/20 text-burgundy-900 font-bold py-2.5 px-6 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                    <button
                      onClick={() => navigateToTab('wish')}
                      className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      Tiup Lilin <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PAGE 5: CANDLE & WISH */}
              {activeTab === 'wish' && (
                <div key="wish" className={`footer-wish flex flex-col items-center w-full max-w-xl ${slideDirection === 'next' ? 'animate-slide-right' : 'animate-slide-left'}`}>
                  <div className="glass-card text-center p-8 md:p-12 w-full flex flex-col items-center">
                    <h2 className="wish-title font-heading text-xl md:text-2xl font-bold text-rose-gold-700 mb-2">
                      Tiup Lilinnya 🎂
                    </h2>
                    <p className="text-burgundy-700 text-xs md:text-sm mb-6">
                      Ucapkan doa terbaik kamu di dalam hati, lalu klik lilin di bawah untuk meniupnya!
                    </p>

                    <div
                      onClick={handleBlowCandle}
                      className="candle-container w-16 h-28 relative cursor-pointer my-6 inline-block"
                    >
                      {/* Flame */}
                      {!isCandleBlown && (
                        <div className="candle-flame w-4 h-8 rounded-[50%_50%_20%_20%] bg-gradient-to-t from-orange-600 via-amber-500 to-orange-100 absolute bottom-20 left-[22px] animate-flicker"></div>
                      )}

                      {/* Wick */}
                      <div className="candle-wick w-[2px] h-3.5 bg-neutral-700 absolute bottom-[72px] left-[29px]"></div>

                      {/* Wax Body */}
                      <div className="candle-wax w-[28px] h-[72px] bg-gradient-to-r from-rose-gold-300 to-rose-gold-500 rounded-md absolute bottom-0 left-[16px] shadow-sm"></div>

                      {/* Smoke animation */}
                      {showSmoke && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg animate-fade-up">
                          💨
                        </div>
                      )}
                    </div>

                    {isCandleBlown && (
                      <div className="congratulations-msg mt-6 animate-pop-in">
                        <h3 className="font-heading text-lg font-bold text-gold-accent-dark mb-2 flex items-center justify-center gap-1">
                          <Sparkles className="w-4 h-4 text-gold-accent" /> Doa Terbaik Dikabulkan! <Sparkles className="w-4 h-4 text-gold-accent" />
                        </h3>
                        <p className="text-burgundy-900 text-xs md:text-sm leading-relaxed max-w-sm mx-auto">
                          Semoga di umur ke-20 ini, semua mimpi indahmu menjadi kenyataan. Mamas akan selalu menemanimu meraihnya cintaku. ❤️
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Guided Navigation Button Group */}
                  <div className="flex gap-4 mt-12 w-full justify-center">
                    <button
                      onClick={() => navigateToTab('coupons')}
                      className="bg-burgundy-900/10 hover:bg-burgundy-900/20 text-burgundy-900 font-bold py-2.5 px-6 rounded-full text-xs hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Kembali
                    </button>
                    <button
                      onClick={() => {
                        confetti({ particleCount: 30, spread: 70 });
                        navigateToTab('welcome');
                      }}
                      className="bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Ulangi dari Awal
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* 
        FOOTER CONTAINER (Always pinned to the absolute bottom of the screen)
        Receives padding to prevent any overlapping with the simulator or player.
      */}
      <footer className="relative z-10 text-center py-6 text-[10px] md:text-xs text-burgundy-600 border-t border-rose-gold-200/20 w-full mt-auto">
        <p>Dibuat dengan segenap rasa sayang ❤️ untuk Pacarku Tercinta</p>
      </footer>

      {/* ==========================================
         ROOT LEVEL LETTER MODAL (Solves the chrome perspective 3D blur bug completely!)
         ========================================== */}
      {isLetterFocused && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
          {/* Backdrop Blur overlay */}
          <div
            onClick={() => setIsLetterFocused(false)}
            className="absolute inset-0 bg-burgundy-900/45 backdrop-blur-sm transition-opacity duration-300"
          ></div>

          {/* Zoomed Letter Card */}
          <div className="relative w-[92%] max-w-[580px] h-[80vh] bg-[#fffdfb] border border-rose-gold-200/50 shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col gap-6 animate-pop z-[2001]">

            {/* Close Button */}
            <button
              onClick={() => setIsLetterFocused(false)}
              className="absolute top-4 right-4 bg-rose-gold-50 hover:bg-rose-gold-100 text-burgundy-700 hover:text-rose-gold-700 p-1.5 rounded-full transition-all duration-300 cursor-pointer shadow-sm"
              aria-label="Close letter"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letter Content Container */}
            <div className="letter-content overflow-y-auto pr-2 no-scrollbar flex flex-col gap-5 h-full">
              <span className="letter-date text-xs text-burgundy-700 font-semibold self-end">
                14 Agustus 2026
              </span>
              <h3 className="font-heading text-xl font-bold text-rose-gold-700 flex items-center gap-1.5">
                Halo Baby, <Heart className="w-5 h-5 fill-rose-gold-500 text-rose-gold-500 animate-pulse" />
              </h3>
              <p className="text-burgundy-900 text-sm leading-relaxed text-justify indent-6">
                Selamat ulang tahun yang ke-20 ya babyyy! Hari ini adalah hari yang sangat-sangat spesial, tidak hanya untuk kamu, tapi juga untuk mamas 
                karena mamas bisa merayakan hari kelahiran orang yang paling berharga dalam hidup mamas.
              </p>
              <p className="text-burgundy-900 text-sm leading-relaxed text-justify indent-6">
                Memasuki usia 20 tahun adalah awal dari babak baru yang luar biasa. Aku tahu perjalanan ke depan mungkin punya 
                tantangan baru, tapi aku ingin kamu tahu kalau mamas akan selalu ada di sini untuk mendukungmu, mendengarkan ceritamu, 
                dan menemani setiap langkahmu.
              </p>
              <p className="text-burgundy-900 text-sm leading-relaxed text-justify indent-6">
                Terima kasih ya sudah menjadi sosok yang selalu membawa keceriaan, kasih sayang, dan kehangatan. Senyumanmu itu 
                selalu bisa mengubah hari-hari biasa jadi terasa luar biasa buat mamas. Semoga di usia yang baru ini, kamu selalu 
                diberikan kesehatan, kebahagiaan, kemudahan dalam meraih impianmu, dan selalu dikelilingi oleh hal-baik.
              </p>
              <p className="text-burgundy-900 text-sm leading-relaxed text-justify indent-6 font-semibold text-rose-gold-600">
                Mamas loves you so much, more than words can say. Selamat hari lahir, Baby! HBD ke-20! 🎂✨
              </p>
              <span className="letter-signature mt-6 text-right text-burgundy-700 leading-none">
                Dari seseorang yang selalu menyayangimu, <br />
                <strong className="font-handwriting text-4xl text-rose-gold-500 inline-block mt-2">Pasanganmu</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Simulator Test Mode Toggle */}
      <button
        onClick={toggleSimulator}
        id="simulator-toggle"
        className="fixed bottom-6 right-6 z-[1000] glass-card flex items-center gap-2 py-2.5 px-5 rounded-full text-xs font-bold text-burgundy-900 border border-rose-gold-300 shadow-lg hover:bg-white hover:scale-105 transition-all duration-300 cursor-pointer"
        title="Simulasi Tampilan Hari Ulang Tahun (14 Agustus)"
      >
        ⚙️ Mode Test Hari-H:{' '}
        <span className={`font-black ${isSimulatorOn ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isSimulatorOn ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
}
