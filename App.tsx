
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Origen from './components/Origen';
import Modos from './components/Modos';
import Proyectos from './components/Proyectos';
import Manifiesto from './components/Manifiesto';
import Contacto from './components/Contacto';
import Footer from './components/Footer';
import VideoModal from './components/VideoModal';

const App: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    <div className="bg-white dark:bg-black text-black dark:text-white selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black min-h-screen transition-colors duration-500">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      
      <main>
        <Hero />
        <Origen />
        <Modos />
        <Proyectos onOpenVideo={setSelectedVideo} />
        <Manifiesto />
        <Contacto />
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
