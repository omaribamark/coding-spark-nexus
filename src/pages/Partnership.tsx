import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building, GraduationCap, Users, Zap } from "lucide-react";
import partnershipImg from "../assets/image-removebg-preview (7) 1.png";

const Partnership = () => {
  const partnershipTypes = [
    {
      icon: Building,
      title: "Startups & Entrepreneurs",
      description: "Collaborate with innovative startups and entrepreneurs to build cutting-edge solutions.",
      benefits: [
        "Technical co-founder support",
        "MVP development",
        "Product strategy consulting",
        "Investor-ready demos"
      ]
    },
    {
      icon: GraduationCap,
      title: "Schools & Institutions",
      description: "Partner with educational institutions to enhance technology education and curriculum.",
      benefits: [
        "Modern curriculum development",
        "Teacher training programs",
        "Student workshops & bootcamps",
        "Career pathway programs"
      ]
    },
    {
      icon: Users,
      title: "Businesses Seeking Digital Transformation",
      description: "Help businesses transform their operations with custom technology solutions.",
      benefits: [
        "Custom software development",
        "Process automation",
        "Digital strategy consulting",
        "Legacy system modernization"
      ]
    },
    {
      icon: Zap,
      title: "Innovation Hubs",
      description: "Work with innovation hubs to foster tech ecosystems and startup growth.",
      benefits: [
        "Incubation programs",
        "Mentorship networks",
        "Technical workshops",
        "Community building"
      ]
    }
  ];

  const currentPartners = [
    { name: "Tech Startup Incubator", type: "Innovation Hub", description: "Startup mentorship and incubation" },
    { name: "City Public Schools", type: "Educational", description: "STEM curriculum development" },
    { name: "Local Business Association", type: "Business", description: "Digital transformation initiatives" },
    { name: "Women in Tech", type: "Community", description: "Diversity and inclusion programs" },
    { name: "University Tech Program", type: "Educational", description: "Student internship programs" },
    { name: "Small Business Network", type: "Business", description: "Technology adoption support" }
  ];

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-oswald">
              Partnerships
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-nunito font-semibold">
              Great things in business are never done by one person, they're<br />
              done by a team of people
            </p>
          </div>
        </div>
      </section>

      {/* We Collaborate With Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 justify-center max-w-6xl mx-auto">
            {/* Collaboration Card */}
            <div className="flex-1 max-w-lg">
              <h2 className="text-2xl font-bold text-[#170961] mb-6 font-oswald underline">
                We collaborate with:
              </h2>
              
              <Card className="p-8 shadow-card hover:shadow-elegant transition-smooth">
                <ul className="space-y-4">
                  {[
                    "Startups & Entrepreneurs",
                    "Businesses seeking digital transformation",
                    "Schools & Institutions", 
                    "Innovation Hubs"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-foreground text-lg font-nunito">
                      <span className="text-[#170961] font-bold mr-3 text-xl">✔</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Contact Section */}
              <div className="mt-8">
                <p className="text-foreground text-lg mb-4 font-nunito">
                  If you are interested in collaborating with Us, send us an email to:
                </p>
                <a
                  href="mailto:careers@codingplayground.tech"
                  className="text-[#170961] font-bold text-xl underline hover:text-[#1a0b70] transition-colors font-oswald"
                >
                  careers@codingplayground.tech
                </a>
              </div>
            </div>

            {/* Partnership Image */}
            <div className="flex-1 flex justify-center lg:justify-start">
              <img 
                src={partnershipImg} 
                alt="Partnerships" 
                className="w-64 h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Partnership Types</h2>
            <p className="text-xl text-muted-foreground font-nunito">Multiple ways to collaborate and grow together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {partnershipTypes.map((type, index) => (
              <Card key={index} className="p-8 shadow-card hover:shadow-elegant transition-smooth">
                <type.icon className="h-12 w-12 text-primary mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-4 font-oswald">{type.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed font-nunito">{type.description}</p>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 font-oswald">Benefits Include:</h4>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground font-nunito">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Why Partner With Us?</h2>
            <p className="text-xl text-muted-foreground font-nunito">The advantages of working together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building,
                title: "Proven Expertise",
                description: "Years of experience in technology development and education with a track record of success."
              },
              {
                icon: Users,
                title: "Strong Network",
                description: "Access to our extensive network of professionals, students, and industry connections."
              },
              {
                icon: Zap,
                title: "Innovation Focus",
                description: "Commitment to staying at the forefront of technology trends and best practices."
              },
              {
                title: "Flexible Approach",
                description: "Customizable partnership models that adapt to your specific needs and goals."
              },
              {
                title: "Mutual Growth",
                description: "Focus on creating win-win relationships that benefit all parties involved."
              },
              {
                title: "Long-term Vision",
                description: "Building lasting partnerships that evolve and grow over time."
              }
            ].map((advantage, index) => (
              <Card key={index} className="p-6 shadow-card text-center">
                {advantage.icon && <advantage.icon className="h-10 w-10 text-primary mx-auto mb-4" />}
                <h4 className="text-lg font-semibold text-foreground mb-3 font-oswald">{advantage.title}</h4>
                <p className="text-muted-foreground text-sm font-nunito">{advantage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Our Current Partners</h2>
            <p className="text-xl text-muted-foreground font-nunito">Organizations we're proud to work with</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPartners.map((partner, index) => (
              <Card key={index} className="p-6 shadow-card">
                <h4 className="text-lg font-semibold text-foreground mb-2 font-oswald">{partner.name}</h4>
                <p className="text-primary text-sm font-medium mb-2 font-nunito">{partner.type} Partner</p>
                <p className="text-muted-foreground text-sm font-nunito">{partner.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Partnership Process</h2>
            <p className="text-xl text-muted-foreground font-nunito">How we build successful partnerships</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Initial Discussion", description: "Share your vision and explore possibilities" },
              { step: "02", title: "Proposal Development", description: "Create a customized partnership proposal" },
              { step: "03", title: "Agreement", description: "Finalize terms and sign partnership agreement" },
              { step: "04", title: "Launch & Growth", description: "Begin collaboration and measure success" },
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {phase.step}
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2 font-oswald">{phase.title}</h4>
                <p className="text-muted-foreground text-sm font-nunito">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-oswald">
            Ready to Partner With Us?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-nunito">
            Let's discuss how we can work together to achieve our mutual goals and create lasting impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="lg"
              className="bg-[#170961] hover:bg-[#1a0b70]"
              onClick={() => window.location.href = 'mailto:careers@codingplayground.tech'}
            >
              Start a Partnership
            </Button>
            <Button variant="outline" size="lg">Download Partnership Guide</Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Partnership;