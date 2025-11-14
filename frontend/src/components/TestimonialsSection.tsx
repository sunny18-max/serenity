import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Clinical Psychologist",
    organization: "Mental Health Institute",
    content: "Serenity provides an excellent bridge between clinical assessment and patient self-monitoring. The validated tools are professionally implemented.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=150&q=80"
  },
  {
    name: "Michael Chen",
    role: "Mental Health Advocate",
    organization: "Wellness Foundation",
    content: "The privacy-first approach and user-friendly interface make mental health tracking accessible to everyone. Truly revolutionary.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&q=80"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Psychiatrist",
    organization: "University Medical Center",
    content: "The integration of PHQ-9 and GAD-7 assessments with AI-powered insights provides valuable clinical support for both patients and providers.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1594824388853-d0c2d8e8b6b3?ixlib=rb-4.0.3&w=150&q=80"
  },
  {
    name: "Dr. James Wilson",
    role: "Therapist",
    organization: "Community Health Center",
    content: "The evidence-based approach and user-friendly design make this an invaluable tool for both clinicians and patients.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=150&q=80"
  },
  {
    name: "Dr. Lisa Park",
    role: "Mental Health Researcher",
    organization: "Research Institute",
    content: "Serenity's commitment to privacy and clinical validation sets a new standard for digital mental health platforms.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&w=150&q=80"
  },
  {
    name: "Robert Martinez",
    role: "Peer Support Specialist",
    organization: "Mental Health Alliance",
    content: "This platform bridges the gap between professional care and personal wellness tracking beautifully.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&q=80"
  }
];

export default function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Duplicate items for seamless loop
    const scrollerContent = Array.from(scroller.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scroller.appendChild(duplicatedItem);
    });
  }, []);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-background to-primary/5 dark:to-primary/10">
      <div className="container mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-secondary/15 border-secondary/30 text-secondary neon-text dark:bg-secondary/25 dark:border-secondary/50 dark:text-secondary">
            💬 Professional Endorsements
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Trusted by
            <span className="text-gradient-primary block">Mental Health Professionals</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Healthcare providers and mental health advocates recognize Serenity's 
            commitment to clinical excellence and user privacy.
          </p>
        </div>

        {/* Infinite Carousel */}
        <div className="w-full overflow-hidden py-8 relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={scrollerRef}
            className="flex gap-6 animate-infinite-scroll hover:pause-animation"
            style={{
              width: 'max-content'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="flex-shrink-0 w-96 group hover:shadow-lg transition-all duration-300 border-0 bg-card/70 backdrop-blur-sm hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <Quote className="w-8 h-8 text-primary/30 mb-4" />
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed italic text-sm">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.organization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
