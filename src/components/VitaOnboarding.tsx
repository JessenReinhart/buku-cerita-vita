import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, PenLine } from 'lucide-react';

export function VitaOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Heart size={48} className="text-blush" />,
      title: "Halo Sayang ✿",
      text: "Selamat datang di Buku Cerita Vita. Tempat rahasia kecil kita berdua."
    },
    {
      icon: <PenLine size={48} className="text-brown-dark" />,
      title: "Ruang Tenangmu",
      text: "Di sini kamu bisa menuliskan apapun. Harimu yang manis, memori yang tak ingin dilupa, atau bahkan isi hatimu saat lelah."
    },
    {
      icon: <Sparkles size={48} className="text-yellow-500" />,
      title: "Mulai Menulis",
      text: "Cukup klik 'Tulis Baru' untuk memulai. Ceritamu akan selalu tersimpan dengan aman di sini."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('vita_onboarding_completed', 'true');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-cream/90 backdrop-blur-sm">
      <motion.div 
        key="onboarding-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl border-4 border-sand text-center relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8 p-6 bg-sand/30 rounded-full">
              {steps[step].icon}
            </div>
            <h2 className="text-3xl font-display font-medium text-brown-dark mb-4">
              {steps[step].title}
            </h2>
            <p className="text-brown-muted text-lg leading-relaxed mb-10">
              {steps[step].text}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 items-center justify-center mt-4">
          <div className="flex gap-2 mr-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blush' : 'bg-sand'}`} 
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-blush text-white shadow-sm font-bold rounded-full hover:bg-blush/90 transition-transform hover:scale-105 active:scale-95"
          >
            {step === steps.length - 1 ? "Mulai" : "Lanjut"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
