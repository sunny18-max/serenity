import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Award, Globe, Users, Heart } from 'lucide-react';

const partnerships = [
  {
    name: "World Health Organization",
    description: "Following WHO guidelines for mental health assessment and care",
    logo: "🏥",
    type: "Guidelines"
  },
  {
    name: "American Psychological Association",
    description: "Adhering to APA standards for psychological assessment tools",
    logo: "🧠",
    type: "Standards"
  },
  {
    name: "National Institute of Mental Health",
    description: "Implementing NIMH research findings in our platform design",
    logo: "🔬",
    type: "Research"
  },
  {
    name: "Mental Health America",
    description: "Supporting MHA's mission to promote mental wellness for all",
    logo: "💚",
    type: "Advocacy"
  }
];

const certifications = [
  {
    title: "HIPAA Compliant",
    description: "Full compliance with healthcare privacy regulations",
    icon: Award
  },
  {
    title: "ISO 27001",
    description: "International standard for information security management",
    icon: Globe
  },
  {
    title: "SOC 2 Type II",
    description: "Rigorous security and availability controls",
    icon: Users
  },
  {
    title: "GDPR Ready",
    description: "European data protection regulation compliance",
    icon: Heart
  }
];

const resources = [
  {
    title: "Crisis Text Line",
    description: "Text HOME to 741741",
    link: "https://www.crisistextline.org/",
    urgent: true
  },
  {
    title: "National Suicide Prevention Lifeline",
    description: "Call 988 or 1-800-273-8255",
    link: "https://suicidepreventionlifeline.org/",
    urgent: true
  },
  {
    title: "Mental Health America",
    description: "Comprehensive mental health resources",
    link: "https://www.mhanational.org/",
    urgent: false
  },
  {
    title: "NAMI (National Alliance on Mental Illness)",
    description: "Support, education, and advocacy",
    link: "https://www.nami.org/",
    urgent: false
  }
];

export default function PartnershipsSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-accent/5 to-focus/5 dark:from-accent/10 dark:to-focus/10">
      <div className="container mx-auto">
        {/* Partnerships */}
        <div className="text-center mb-16" data-aos="fade-up">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-accent/15 border-accent/30 text-accent neon-text dark:bg-accent/25 dark:border-accent/50 dark:text-accent">
            🤝 Trusted Partnerships
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Aligned with
            <span className="text-gradient-primary block">Global Standards</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We work closely with leading mental health organizations to ensure 
            our platform meets the highest professional standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {partnerships.map((partner, index) => (
            <Card 
              key={index}
              className="text-center p-6 border-0 bg-card/70 backdrop-blur-sm hover:shadow-medium hover:-translate-y-2 transition-all duration-300"
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <div className="text-4xl mb-4">{partner.logo}</div>
              <h3 className="font-semibold mb-2 text-sm">{partner.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{partner.description}</p>
              <Badge variant="secondary" className="text-xs">
                {partner.type}
              </Badge>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/20 mb-16" data-aos="fade-up">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold mb-4">
              Security & Compliance Certifications
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your data security and privacy are our top priorities. We maintain the highest 
              industry standards for healthcare data protection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div 
                key={index}
                className="text-center"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <cert.icon className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{cert.title}</h4>
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Resources */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-3xl p-8 border border-red-200/50 dark:border-red-800/50" data-aos="fade-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4 text-red-800 dark:text-red-200">
              Crisis Support Resources
            </h3>
            <p className="text-red-700 dark:text-red-300 max-w-2xl mx-auto mb-6">
              If you're experiencing a mental health crisis, please reach out for immediate help. 
              You are not alone, and support is available 24/7.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <Card 
                key={index}
                className={`p-4 ${resource.urgent ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20' : 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20'}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardContent className="p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-red-800 dark:text-red-200">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        {resource.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 btn-enhanced"
                      onClick={() => window.open(resource.link, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Remember: Serenity is a wellness tool, not a replacement for professional mental health care.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
