import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Github, Linkedin, Code, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  const developers = [
    {
      name: "Saathvik Kalepu",
      role: "Frontend Developer & Team Leader",
      rollNo: "123cs0013",
      email: "123cs0013@iiitk.ac.in",
      phone: "+91-XXXXX-XXXXX",
      tech: ["React", "TypeScript", "Tailwind CSS", "UI/UX Design"],
      github: "https://github.com/sunny18-max",
      linkedin: "https://www.linkedin.com/in/saathvik-kalepu-17041228b/",
      description: "Leading the frontend development with modern React architecture and user experience design."
    },
    {
      name: "M. Thanuj Kumar", 
      role: "Backend Developer",
      rollNo: "123cs0040",
      email: "123cs0040@iiitk.ac.in",
      phone: "+91-XXXXX-XXXXX",
      tech: ["Node.js", "Express", "MongoDB", "API Development"],
      github: "#",
      linkedin: "https://www.linkedin.com/in/manchuri-thanuj-kumar-reddy-aa5907378/",
      description: "Building robust backend systems, database architecture, and API development."
    },
    {
      name: "M. Harsha Vardhan Reddy",
      role: "Full Stack Developer", 
      rollNo: "123cs0044",
      email: "123cs0044@iiitk.ac.in",
      phone: "+91-XXXXX-XXXXX",
      tech: ["React", "Node.js", "Database", "DevOps"],
      github: "#",
      linkedin: "https://www.linkedin.com/in/harsha-vardhan-b6a49a36b/",
      description: "Bridging frontend and backend with seamless integration and system architecture."
    },
    {
      name: "Umesh Rathod",
      role: "UI/UX & Integration",
      rollNo: "123cs0055", 
      email: "123cs0055@iiitk.ac.in",
      phone: "+91-XXXXX-XXXXX",
      tech: ["Figma", "React", "Animation", "Integration"],
      github: "#",
      linkedin: "https://www.linkedin.com/in/rathlavath-umesh-973978372/",
      description: "Crafting beautiful user experiences, animations, and handling system integration."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-cursive font-bold text-gradient-primary">Serenity</h1>
            </div>
            <Link to="/" className="text-muted-foreground hover:text-primary">Back to Home</Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-2 bg-primary/10 border-primary/30 text-primary">
              👨‍💻 Meet the Development Team
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Contact Our
              <span className="text-gradient-primary block font-cursive">Developers</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-body">
              Get in touch with the passionate team behind Serenity. We're students from IITDM Kurnool 
              dedicated to revolutionizing mental health care through technology.
            </p>
          </div>

          {/* Developer Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {developers.map((dev, index) => (
              <Card key={index} className="team-card group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white text-xl font-bold shadow-glow flex-shrink-0">
                      {dev.name.split(' ').map(n => n[0]).join('')}
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
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                      <a href={dev.github} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                      <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Faculty Supervisor */}
          <Card className="mb-12 p-8 bg-gradient-calm text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Faculty Supervisor</h2>
              <div className="flex items-center justify-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                  VS
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">Dr. V. Siva Rama Krishnaiah</h3>
                  <p className="text-lg opacity-90">Professor</p>
                  <p className="opacity-80">Department of Computer Science and Engineering</p>
                  <p className="opacity-80">IITDM Kurnool</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Project Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Code className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold mb-2">CS307 Project</h3>
              <p className="text-sm text-muted-foreground font-body">
                Software Engineering Practice
              </p>
            </Card>
            <Card className="text-center p-6">
              <Users className="w-12 h-12 text-wellness mx-auto mb-4" />
              <h3 className="font-bold mb-2">Team 5</h3>
              <p className="text-sm text-muted-foreground font-body">
                MHAITS Development Team
              </p>
            </Card>
            <Card className="text-center p-6">
              <MapPin className="w-12 h-12 text-energy mx-auto mb-4" />
              <h3 className="font-bold mb-2">IITDM Kurnool</h3>
              <p className="text-sm text-muted-foreground font-body">
                Indian Institute of Information Technology
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;