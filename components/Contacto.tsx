
import React, { useState } from 'react';
import Reveal from './Reveal';

const Contacto: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section id="contacto" className="py-32 md:py-64 px-8 md:px-24 bg-white dark:bg-black transition-colors duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div>
          <Reveal>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-12">
              CONTACTO
            </h2>
            <div className="space-y-12 text-xl font-light">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest opacity-40 mb-2">E-mail</p>
                <a href="mailto:hello@cineprood.com" className="text-2xl md:text-3xl hover:opacity-60 transition-colors">hello@cineprood.com</a>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest opacity-40 mb-2">Ubicación</p>
                <p className="text-2xl md:text-3xl">España</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={200}>
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="group">
                <label className="block text-xs uppercase tracking-[0.3em] opacity-40 mb-4 group-focus-within:opacity-100 transition-opacity">Nombre</label>
                <input 
                  type="text" 
                  required
                  placeholder="Tu nombre"
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 focus:outline-none focus:border-black dark:focus:border-white transition-all text-xl"
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-[0.3em] opacity-40 mb-4 group-focus-within:opacity-100 transition-opacity">Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="email@ejemplo.com"
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 focus:outline-none focus:border-black dark:focus:border-white transition-all text-xl"
                  value={formState.email}
                  onChange={(e) => setFormState({...formState, email: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-[0.3em] opacity-40 mb-4 group-focus-within:opacity-100 transition-opacity">Mensaje</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Cuéntanos tu proyecto"
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 focus:outline-none focus:border-black dark:focus:border-white transition-all text-xl resize-none"
                  value={formState.message}
                  onChange={(e) => setFormState({...formState, message: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.4em] hover:opacity-80 transition-all duration-500 disabled:opacity-50"
                disabled={submitted}
              >
                {submitted ? 'ENVIADO CORRECTAMENTE' : 'ENVIAR MENSAJE'}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
