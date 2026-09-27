
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HistoriaVideo from './components/HistoriaVideo';
import Modos from './components/Modos';
import CinematicBanner from './components/CinematicBanner';
import Proyectos from './components/Proyectos';
import Fotos from './components/Fotos';
import RedesSociales from './components/RedesSociales';
import Reveal from './components/Reveal';
import Footer from './components/Footer';
import VideoModal from './components/VideoModal';

const App: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVideoActive, setIsVideoActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedVideo(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white selection:bg-red-600 selection:text-white min-h-screen transition-colors duration-500">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} isVideoActive={isVideoActive} />
      
      <main>
        <Hero />
        <HistoriaVideo onVideoActiveChange={setIsVideoActive} />
        <Modos />
        <CinematicBanner onOpenVideo={setSelectedVideo} />
        <Proyectos onOpenVideo={setSelectedVideo} />
        
        {/* Transition Message */}
        <section className="py-32 md:py-48 bg-white dark:bg-black transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-8 md:px-24 text-center">
            <Reveal>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                También <span className="italic font-light opacity-40">capturamos</span>
              </h2>
              <div className="mt-8 flex justify-center">
                <div className="w-12 h-[1px] bg-black dark:bg-white opacity-20"></div>
              </div>
            </Reveal>
          </div>
        </section>

        <Fotos />
        <RedesSociales />
      </main>

      <Footer />

      {selectedVideo && (
        <VideoModal 
          videoUrl={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

export default App;
