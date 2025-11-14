import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Award, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const researchData = [
  {
    title: "Global Mental Health Statistics",
    description: "1 in 8 people globally live with a mental disorder, with anxiety and depression being the most common.",
    source: "World Health Organization (WHO), 2022",
    link: "https://www.who.int/news-room/fact-sheets/detail/mental-disorders",
    icon: Users,
    stat: "970M",
    statLabel: "People Affected Globally"
  },
  {
    title: "PHQ-9 Validation Studies",
    description: "The Patient Health Questionnaire-9 shows 88% sensitivity and 88% specificity for major depression.",
    source: "Kroenke et al., Journal of General Internal Medicine, 2001",
    link: "https://pubmed.ncbi.nlm.nih.gov/11556941/",
    icon: Award,
    stat: "88%",
    statLabel: "Clinical Accuracy"
  },
  {
    title: "Digital Mental Health Efficacy",
    description: "Digital interventions show significant improvements in mental health outcomes with proper clinical backing.",
    source: "Baumel et al., JMIR Mental Health, 2017",
    link: "https://mental.jmir.org/2017/2/e14/",
    icon: TrendingUp,
    stat: "65%",
    statLabel: "Improvement Rate"
  }
];

const clinicalTools = [
  {
    name: "PHQ-9",
    fullName: "Patient Health Questionnaire-9",
    description: "Validated screening tool for depression severity",
    validation: "Kroenke et al., 2001"
  },
  {
    name: "GAD-7",
    fullName: "Generalized Anxiety Disorder 7-item",
    description: "Reliable measure for anxiety disorder screening",
    validation: "Spitzer et al., 2006"
  },
  {
    name: "PCL-5",
    fullName: "PTSD Checklist for DSM-5",
    description: "Comprehensive PTSD symptom assessment",
    validation: "Weathers et al., 2013"
  }
];

export default function ResearchSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-secondary/5 to-accent/5 dark:from-secondary/10 dark:to-accent/10">
      <div className="container mx-auto">
        {/* Research & Evidence */}
        <div className="text-center mb-16" data-aos="fade-up">
          <Badge variant="outline" className="mb-4 px-4 py-2 bg-focus/15 border-focus/30 text-focus neon-text dark:bg-focus/25 dark:border-focus/50 dark:text-focus">
            📄 Evidence-Based Approach
          </Badge>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Backed by
            <span className="text-gradient-primary block">Scientific Research</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our platform is built on peer-reviewed research and clinically validated assessment tools 
            used by mental health professionals worldwide.
          </p>
        </div>

        {/* Research Statistics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {researchData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 bg-card/70 backdrop-blur-sm hover:shadow-medium hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{item.stat}</div>
                      <div className="text-xs text-muted-foreground">{item.statLabel}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                    {item.description}
                  </p>
                  
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Source:</p>
                    <p className="text-xs font-medium mb-3">{item.source}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs btn-enhanced"
                      onClick={() => window.open(item.link, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      View Research
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Clinical Tools */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/20" data-aos="fade-up">
          <div className="text-center mb-8">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-serif font-bold mb-4">
              Clinically Validated Assessment Tools
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We use only peer-reviewed, scientifically validated instruments that are 
              trusted by mental health professionals globally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {clinicalTools.map((tool, index) => (
              <div 
                key={index}
                className="bg-background/50 rounded-xl p-6 border border-border/10"
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-lg">{tool.name}</span>
                  </div>
                  <h4 className="font-semibold mb-2">{tool.fullName}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                  <p className="text-xs text-primary font-medium">{tool.validation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
