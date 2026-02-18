
import React from 'react';
import Reveal from './Reveal';

interface Proyecto {
  id: string;
  title: string;
  type: string;
  video: string;
}

const proyectos: Proyecto[] = [
  { 
    id: "1", 
    title: "Perco | Sova | Issefe", 
    type: "Tradicional", 
    video: "https://player.vimeo.com/video/1165151705" 
  },
  { 
    id: "2", 
    title: "Jeep — Spec Commercial", 
    type: "Híbrido", 
    video: "https://player.vimeo.com/video/1163583249" 
  },
  { 
    id: "3", 
    title: "Bipolar — Dsantos", 
    type: "Tradicional", 
    video: "https://player.vimeo.com/video/1165150421" 
  },
  { 
    id: "4", 
    title: "Ferrari Aspire", 
    type: "IA", 
    video: "https://player.vimeo.com/video/1163585610" 
  }
];

const Proyectos: React.FC<{ onOpenVideo: (url: string) => void }> = ({ onOpenVideo }) => {
  return (
    <section id="proyectos" className="py-32 md:py-64 px-8 md:px-24 bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <Reveal className="mb-32">
          <p className="text-[10px] md:text-xs font-mono tracking-[0.8em] uppercase opacity-30 mb-4 select-none">
            Portafolio
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
          {proyectos.map((p, i) => (
            <Reveal 
              key={p.id} 
              delay={i * 100} 
              className="group cursor-pointer" 
              onClick={() => onOpenVideo(p.video)}
            >
              <div className="relative aspect-video bg-black/5 dark:bg-[#080808] border border-black/5 dark:border-white/5 overflow-hidden mb-8 transition-all duration-700 group-hover:border-black/20 dark:group-hover:border-white/20">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/80 to-transparent opacity-60"></div>
                
                <div className="absolute inset-0 flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
                  <div className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-[10px] font-black uppercase tracking-[0.4em]">
                    VER PROYECTO
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/5 dark:bg-white/5 transition-transform duration-1000 ease-out group-hover:scale-[1.05]"></div>
              </div>

              <div className="flex flex-col gap-2 border-l border-black/0 dark:border-white/0 group-hover:border-black/20 dark:group-hover:border-white/20 pl-0 group-hover:pl-6 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <h4 className="text-xl md:text-2xl font-bold tracking-tight uppercase transition-colors">
                    {p.title}
                  </h4>
                  <span className="text-[9px] font-mono opacity-20 uppercase tracking-widest pt-2">
                    {p.type}
                  </span>
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
    </section>
  );
};

export default Proyectos;
