import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Github, Linkedin, Code, Sparkles, ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ThemeToggle } from '@/components/ThemeToggle';

const Contact = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      mirror: false,
      offset: 50
    });
  }, []);

  const developers = [
    {
      name: "Saathvik Kalepu",
      role: "Frontend Developer & Team Leader",
      rollNo: "123cs0013",
      email: "123cs0013@iiitk.ac.in",
      phone: "+91-9908179816",
      tech: ["React", "TypeScript", "Tailwind CSS", "UI/UX Design"],
      github: "https://github.com/sunny18-max",
      linkedin: "https://www.linkedin.com/in/saathvik-kalepu-17041228b/",
      description: "Leading the frontend development with modern React architecture and user experience design.",
      image: "/images/team/saathvik.jpg"
    },
    {
      name: "M. Thanuj Kumar", 
      role: "Backend Developer",
      rollNo: "123cs0040",
      email: "123cs0040@iiitk.ac.in",
      phone: "+91-9550500838",
      tech: ["Node.js", "Express", "MongoDB", "API Development"],
      github: "#",
      linkedin: "https://www.linkedin.com/in/manchuri-thanuj-kumar-reddy-aa5907378/",
      description: "Building robust backend systems, database architecture, and API development.",
      image: "/images/team/thanuj.jpg"
    },
    {
      name: "M. Harsha Vardhan Reddy",
      role: "Full Stack Developer", 
      rollNo: "123cs0044",
      email: "123cs0044@iiitk.ac.in",
      phone: "+91-8333868606",
      tech: ["React", "Node.js", "Database", "DevOps"],
      github: "https://github.com/Harsha-76",
      linkedin: "https://www.linkedin.com/in/harsha-vardhan-b6a49a36b/",
      description: "Bridging frontend and backend with seamless integration and system architecture.",
      image: "/images/team/harsha.jpg"
    },
    {
      name: "Umesh Rathod",
      role: "UI/UX & Integration",
      rollNo: "123cs0055", 
      email: "123cs0055@iiitk.ac.in",
      phone: "+91-7021440840",
      tech: ["Figma", "React", "Animation", "Integration"],
      github: "https://github.com/umeshrathlavath",
      linkedin: "https://www.linkedin.com/in/rathlavath-umesh-973978372/",
      description: "Crafting beautiful user experiences, animations, and handling system integration.",
      image: "/images/team/umesh.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 cyber-grid">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-cursive font-bold text-gradient-primary">Serenity</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link 
                to="/" 
                className="inline-flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12" data-aos="fade-up">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/30 text-primary neon-text dark:bg-primary/20 dark:border-primary/50 dark:text-primary">
              👨‍💻 Meet the Development Team
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Contact Our
              <span className="text-gradient-primary block font-cursive">Developers</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-body leading-relaxed">
              Get in touch with the passionate team behind Serenity. We're students from IITDM Kurnool 
              dedicated to revolutionizing mental health care through technology.
            </p>
          </div>

          {/* Developer Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {developers.map((dev, index) => (
              <Card 
                key={index} 
                className="team-card group hover:shadow-medium hover:-translate-y-2 transition-all duration-300 border-0 bg-card/70 backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center overflow-hidden shadow-glow flex-shrink-0">
                      {dev.image ? (
                        <img 
                          src={dev.image} 
                          alt={dev.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const nextSibling = target.nextSibling as HTMLElement;
                            if (nextSibling) {
                              nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-white text-xl font-bold ${dev.image ? 'hidden' : 'flex'}`}>
                        {dev.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold">{dev.name}</CardTitle>
                      <p className="text-primary font-medium">{dev.role}</p>
                      <p className="text-sm text-muted-foreground">Roll No: {dev.rollNo}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground font-body">{dev.description}</p>
                  
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{dev.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{dev.phone}</span>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <p className="text-xs font-semibold text-accent mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {dev.tech.map((tech, techIndex) => (
                        <Badge 
                          key={techIndex} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 btn-enhanced" asChild>
                      <a href={dev.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 btn-enhanced" asChild>
                      <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;