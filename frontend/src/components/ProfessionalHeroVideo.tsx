import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfessionalHeroVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10 relative border border-border/20 shadow-2xl">
      {/* Professional Mental Health Video */}
      <div className="relative w-full h-full">
        {!isPlaying ? (
          // Thumbnail with play button
          <div className="relative w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Mental Health and Wellness - Professional therapy session"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={() => setIsPlaying(true)}
                className="w-20 h-20 rounded-full bg-white/90 hover:bg-white text-primary hover:text-primary shadow-2xl transition-all duration-300 hover:scale-110"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>

            {/* Video Info Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Understanding Mental Health: A Professional Perspective
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Learn how Serenity combines clinical expertise with modern technology
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Embedded Video
          <div className="relative w-full h-full">
            <iframe
              src="https://www.youtube.com/embed/DxIDKZHW3-E?autoplay=1&rel=0&modestbranding=1"
              title="Mental Health Awareness and Wellness"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-3xl"
            />
            
            {/* Close Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <Pause className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
