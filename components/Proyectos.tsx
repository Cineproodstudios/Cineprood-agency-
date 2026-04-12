
import React, { useState } from 'react';
import Reveal from './Reveal';

interface Proyecto {
  id: string;
  title: string;
  video: string;
  image?: string;
}

const proyectos: Proyecto[] = [
  { 
    id: "2", 
    title: "Jeep — Spec Commercial", 
    video: "https://player.vimeo.com/video/1163583249",
    image: "https://i.postimg.cc/yxXVhQmJ/hf-20260203-123826-56d416d4-9f59-43c4-8baa-0514cf967b19.jpg"
  },
  { 
    id: "3", 
    title: "Bipolar — Dsantos", 
    video: "https://player.vimeo.com/video/1165150421",
    image: "https://i.postimg.cc/B647Lmn7/hf-20260127-112721-bbb00a6f-9c68-4a3e-b237-9642bf6dc785.png"
  },
  { 
    id: "4", 
    title: "Ferrari Aspire", 
    video: "https://player.vimeo.com/video/1163585610",
    image: "https://i.postimg.cc/RFWdn2zf/IMG-3842-Recuperado.jpg"
  },
  {
    id: "5",
    title: "Valhalla | phillips oneblade",
    video: "https://player.vimeo.com/video/1169509590",
    image: "https://i.postimg.cc/cLF0xkM4/hf-20260206-141712-aafaaf6a-0721-4e3d-87fb-c6641cc191eb.png"
  },
  {
    id: "6",
    title: "Cruzcampo Pilsen Una obra de arte",
    video: "https://player.vimeo.com/video/1180748644",
    image: "https://i.postimg.cc/MHGVssfL/hf-20260406-122659-1c3aed91-fcf1-4147-8427-afb51d25cb6a-(1).jpg"
  },
  {
    id: "7",
    title: "Tous | freedom",
    video: "https://player.vimeo.com/video/1182416321",
    image: "https://i.postimg.cc/7ZhLrr2N/Timeline-1-01-00-19-23.jpg"
  }
];

const accidentadosImages = [
  "https://i.postimg.cc/qBsLQm90/Timeline-1-01-00-08-07.jpg",
  "https://i.postimg.cc/KcPNQ9db/Timeline-1-01-01-05-18.jpg",
  "https://i.postimg.cc/9Xdp1xvc/Timeline-1-01-01-20-17.jpg",
  "https://i.postimg.cc/y6mPnfws/Timeline-1-01-02-45-23.jpg",
  "https://i.postimg.cc/v8rzXPpY/Timeline-1-01-03-02-13.jpg",
  "https://i.postimg.cc/pVfZk0gV/Timeline-1-01-03-11-20.jpg",
  "https://i.postimg.cc/Y2638XJq/Timeline-1-01-03-41-09.jpg",
  "https://i.postimg.cc/XqkkJJw1/Timeline-1-01-05-21-12.jpg"
];

const murmulloImages = [
  "https://i.postimg.cc/QMP34NKn/Timeline-1-01-00-25-12.jpg",
  "https://i.postimg.cc/W3kPQR06/Timeline-1-01-04-19-02.jpg",
  "https://i.postimg.cc/ydZzwq0T/Timeline-1-01-13-37-10.jpg",
  "https://i.postimg.cc/pTFtgNKC/Timeline-1-01-13-51-18.jpg",
  "https://i.postimg.cc/8C3SKkfy/Timeline-1-01-16-20-12.jpg",
  "https://i.postimg.cc/mrqsXZ15/Timeline-1-01-16-45-20.jpg"
];

const humoImages = [
  "https://i.postimg.cc/cHCqrdd2/Timeline-1-01-00-04-10.jpg",
  "https://i.postimg.cc/Tw18pTRv/Timeline-1-01-00-16-01.jpg",
  "https://i.postimg.cc/63qsyB9w/Timeline-1-01-03-10-12.jpg",
  "https://i.postimg.cc/tTJ0Y9XH/Timeline-1-01-03-22-08.jpg",
  "https://i.postimg.cc/FRzt7h9N/Timeline-1-01-03-49-15.jpg",
  "https://i.postimg.cc/cHCqrds4/Timeline-1-01-04-13-00.jpg",
  "https://i.postimg.cc/XJqMpnVv/Timeline-1-01-06-15-20.jpg",
  "https://i.postimg.cc/cHCqrdsH/Timeline-1-01-07-21-20.jpg"
];

const Proyectos: React.FC<{ onOpenVideo: (url: string) => void }> = ({ onOpenVideo }) => {
  const [view, setView] = useState<'portfolio' | 'shorts'>('portfolio');
  const portfolioRef = React.useRef<HTMLDivElement>(null);
  const shortsRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | string>('auto');

  React.useEffect(() => {
    const updateHeight = () => {
      if (view === 'portfolio' && portfolioRef.current) {
        setHeight(portfolioRef.current.offsetHeight);
      } else if (view === 'shorts' && shortsRef.current) {
        setHeight(shortsRef.current.offsetHeight);
      }
    };

    updateHeight();
    // Also update on window resize
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [view]);

  return (
    <section id="proyectos" className="bg-white dark:bg-black transition-all duration-1000 ease-expo overflow-hidden" style={{ height }}>
      <div 
        className="flex w-[200%] transition-transform duration-1000 ease-expo items-start"
        style={{ transform: `translateX(${view === 'portfolio' ? '0%' : '-50%'})` }}
      >
        {/* VIEW 1: PORTFOLIO */}
        <div ref={portfolioRef} className="w-1/2 py-24 md:py-32 px-8 md:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-32">
              <Reveal>
                <p className="text-[10px] md:text-xs font-mono tracking-[0.8em] uppercase opacity-30 mb-4 select-none">
                  Portafolio
                </p>
              </Reveal>
              <Reveal delay={200}>
                <button 
                  onClick={() => setView('shorts')}
                  className="group flex items-center gap-4 px-6 py-3 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white text-[10px] font-mono tracking-[0.4em] uppercase transition-all duration-500 bg-black/5 dark:bg-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                >
                  <span>Cortometrajes</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:translate-x-1">
                    <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
              {proyectos.map((p, i) => (
                <Reveal 
                  key={p.id} 
                  delay={i * 100} 
                  className="group cursor-pointer" 
                  onClick={() => onOpenVideo(p.video)}
                >
                  <div className="relative aspect-video bg-black/5 dark:bg-[#080808] border border-black/5 dark:border-white/5 overflow-hidden mb-8 transition-all duration-700 group-hover:border-black/20 dark:group-hover:border-white/20">
                    {p.image && (
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/80 to-transparent opacity-60"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                      <div className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em]">
                        VER PROYECTO
                      </div>
                    </div>

                    {!p.image && (
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 transition-transform duration-1000 ease-out group-hover:scale-[1.05]"></div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 border-l border-black/0 dark:border-white/0 group-hover:border-black/20 dark:group-hover:border-white/20 pl-0 group-hover:pl-6 transition-all duration-500">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl md:text-2xl font-bold tracking-tight uppercase transition-colors">
                        {p.title}
                      </h4>
                    </div>
                    
                    <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full relative mt-2 overflow-hidden">
                      <div className="absolute inset-0 bg-black dark:bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-40 text-center" delay={300}>
              <p className="text-xs font-mono tracking-[0.4em] uppercase opacity-30 select-none">
                Nuevas piezas en producción constante.
              </p>
            </Reveal>
          </div>
        </div>

        {/* VIEW 2: SHORTS */}
        <div ref={shortsRef} className="w-1/2 py-24 md:py-32 px-8 md:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-24">
              <Reveal>
                <div>
                  <p className="text-[10px] md:text-xs font-mono tracking-[0.8em] uppercase opacity-30 mb-4 select-none">
                    Cortometrajes
                  </p>
                  <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                    Accidentados
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <button 
                  onClick={() => setView('portfolio')}
                  className="group flex items-center gap-4 px-6 py-3 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white text-[10px] font-mono tracking-[0.4em] uppercase transition-all duration-500 bg-black/5 dark:bg-white/5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180 transition-transform group-hover:-translate-x-1">
                    <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Volver</span>
                </button>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {accidentadosImages.map((src, i) => (
                <Reveal 
                  key={`acc-${i}`} 
                  delay={i * 100} 
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img 
                    src={src} 
                    alt={`Accidentados frame ${i + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* MURMULLO DE LOS GRILLOS */}
            <Reveal className="mt-48 mb-24">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                Murmullo de los grillos
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {murmulloImages.map((src, i) => (
                <Reveal 
                  key={`mur-${i}`} 
                  delay={i * 100} 
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img 
                    src={src} 
                    alt={`Murmullo frame ${i + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>

            {/* HUMO */}
            <Reveal className="mt-48 mb-24">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">
                Humo
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {humoImages.map((src, i) => (
                <Reveal 
                  key={`humo-${i}`} 
                  delay={i * 100} 
                  className={`relative overflow-hidden group ${
                    i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video'
                  }`}
                >
                  <img 
                    src={src} 
                    alt={`Humo frame ${i + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white opacity-0 group-hover:opacity-60 transition-opacity duration-500 uppercase tracking-widest">
                    Frame 0{i + 1}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proyectos;
