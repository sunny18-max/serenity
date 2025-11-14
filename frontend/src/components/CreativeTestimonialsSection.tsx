import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Clinical Psychologist",
    organization: "Mental Health Institute",
    content: "Serenity provides an excellent bridge between clinical assessment and patient self-monitoring. The validated tools are professionally implemented.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=400&q=80",
    video: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&w=800&q=80",
    location: "New York, USA",
    specialty: "Anxiety & Depression"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Mental Health Advocate",
    organization: "Wellness Foundation",
    content: "The privacy-first approach and user-friendly interface make mental health tracking accessible to everyone. Truly revolutionary.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=400&q=80",
    video: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=800&q=80",
    location: "San Francisco, USA",
    specialty: "Digital Mental Health"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Psychiatrist",
    organization: "University Medical Center",
    content: "The integration of PHQ-9 and GAD-7 assessments with AI-powered insights provides valuable clinical support for both patients and providers.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1594824388853-d0c2d8e8b6b3?ixlib=rb-4.0.3&w=400&q=80",
    video: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&w=800&q=80",
    location: "London, UK",
    specialty: "Psychiatric Assessment"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    role: "Therapist",
    organization: "Community Health Center",
    content: "The evidence-based approach and user-friendly design make this an invaluable tool for both clinicians and patients.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=400&q=80",
    video: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=800&q=80",
    location: "Toronto, Canada",
    specialty: "Cognitive Behavioral Therapy"
  }
];

export default function CreativeTestimonialsSection() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Unique Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/5" />
        
        {/* Animated Mesh Gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <Badge 
            variant="outline" 
            className="mb-6 px-6 py-3 bg-secondary/15 border-secondary/30 text-secondary backdrop-blur-sm"
          >
            💬 Professional Endorsements
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Trusted by
            </span>
            <br />
            <span className="text-foreground">Mental Health Professionals</span>
          </h2>
        </div>

        {/* Unique Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Video/Image Showcase */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Main Video/Image Container */}
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={testimonials[activeTestimonial].video}
                    alt={`${testimonials[activeTestimonial].name} testimonial`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="lg"
                      className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-white/50"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </Button>
                  </motion.div>

                  {/* Professional Info Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      <div className="flex items-center space-x-4">
                        <img
                          src={testimonials[activeTestimonial].image}
                          alt={testimonials[activeTestimonial].name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
                        />
                        <div className="text-white">
                          <h4 className="font-bold text-lg">{testimonials[activeTestimonial].name}</h4>
                          <p className="text-sm opacity-90">{testimonials[activeTestimonial].role}</p>
                          <p className="text-xs opacity-75">{testimonials[activeTestimonial].location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Specialty Badge */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {testimonials[activeTestimonial].specialty}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Testimonial Content */}
          <div className="space-y-8">
            
            {/* Quote Section */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-0">
                    {/* Quote Icon */}
                    <Quote className="w-12 h-12 text-primary/40 mb-6" />
                    
                    {/* Rating */}
                    <div className="flex items-center mb-6">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-6 h-6 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Quote Text */}
                    <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground mb-8 font-medium">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>
                    
                    {/* Author Info */}
                    <div className="border-t border-border pt-6">
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {testimonials[activeTestimonial].name}
                      </h4>
                      <p className="text-primary font-medium mb-1">
                        {testimonials[activeTestimonial].role}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonials[activeTestimonial].organization}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTestimonial(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === activeTestimonial 
                        ? 'bg-primary w-8' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Auto-play Toggle */}
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Thumbnails */}
        <div className="mt-16 flex justify-center space-x-4 overflow-x-auto pb-4">
          {testimonials.map((testimonial, index) => (
            <motion.button
              key={testimonial.id}
              onClick={() => {
                setActiveTestimonial(index);
                setIsAutoPlaying(false);
              }}
              className={`flex-shrink-0 relative ${
                index === activeTestimonial ? 'ring-4 ring-primary' : ''
              } rounded-2xl overflow-hidden transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-20 h-20 object-cover"
              />
              {index === activeTestimonial && (
                <div className="absolute inset-0 bg-primary/20" />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
