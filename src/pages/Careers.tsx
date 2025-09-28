import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign } from "lucide-react";
import weAreHiring from "../assets/image 17.png";

const Careers = ({ onApply }) => {
  const handleApplyNow = () => {
    if (onApply) {
      onApply();
    }
  };

  const openPositions = [
    {
      title: "Software Engineer",
      department: "Engineering",
      location: "Remote / Hybrid",
      type: "Full-time",
      salary: "Competitive",
      description: "Join our engineering team to build innovative software solutions and scalable applications.",
      requirements: ["Strong programming fundamentals", "Problem-solving skills", "Team collaboration", "Continuous learning mindset"]
    },
    {
      title: "Frontend/Backend Developer",
      department: "Engineering",
      location: "Remote / Hybrid",
      type: "Full-time",
      salary: "Competitive",
      description: "Develop user-facing features and robust backend systems for our platforms.",
      requirements: ["JavaScript/TypeScript", "React or Node.js", "API development", "Database knowledge"]
    },
    // {
    //   title: "Coding Instructor",
    //   department: "Education",
    //   location: "Hybrid",
    //   type: "Full-time",
    //   salary: "Competitive",
    //   description: "Teach and mentor students in our coding and technology training programs.",
    //   requirements: ["Teaching experience", "Technical expertise", "Communication skills", "Patience & empathy"]
    // },
    {
      title: "Business Development Lead",
      department: "Business",
      location: "Remote",
      type: "Full-time",
      salary: "Base + Commission",
      description: "Drive business growth by connecting with potential clients and partners.",
      requirements: ["Sales experience", "Communication skills", "Strategic thinking", "Goal-oriented mindset"]
    },
    {
      title: "Digital Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "Competitive",
      description: "Develop and execute digital marketing strategies to grow our brand presence.",
      requirements: ["Digital marketing experience", "Content creation", "Analytics proficiency", "Creative thinking"]
    },
    {
      title: "Robotics Engineer (Tutor)",
      department: "Education",
      location: "Hybrid",
      type: "Full-time",
      salary: "Competitive",
      description: "Teach robotics and engineering concepts to students of all levels.",
      requirements: ["Robotics experience", "Teaching ability", "Technical knowledge", "Passion for STEM education"]
    },
    {
      title: "Video Editor",
      department: "Content",
      location: "Remote",
      type: "Full-time",
      salary: "Competitive",
      description: "Create engaging video content for our courses and marketing materials.",
      requirements: ["Video editing skills", "Creative storytelling", "Software proficiency", "Attention to detail"]
    }
  ];

  const benefits = [
    "Health & Wellness Benefits",
    "Flexible Work Arrangements",
    "Professional Development",
    "Learning & Growth Opportunities",
    "Modern Equipment & Tools",
    "Team Building Activities",
    "Mentorship Programs",
    "Impactful Work Environment"
  ];

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-oswald">
              Careers
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-nunito font-semibold">
              Join our growing team of innovators, developers, and educators.
            </p>
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed font-nunito max-w-3xl mx-auto">
              At CodingPlayGround Technologies, we're building a culture of innovation, creativity, and impact. We welcome passionate people at all levels, including entry-level applicants eager to learn. We also offer internships for beginners looking to hone their skills and grow into professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Current Open Roles & Hiring Image */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16 justify-center max-w-6xl mx-auto">
            {/* Open Roles Card */}
            <Card className="p-8 shadow-card hover:shadow-elegant transition-smooth flex-1 max-w-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#170961] mb-2 font-oswald underline">
                  Current Open Roles
                </h2>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "Software Engineer",
                  "Frontend/Backend Developer", 
                  "Coding Instructor",
                  "Business Development Lead",
                  "Digital Marketing Specialist",
                  "Robotics Engineer (Tutor)",
                  "Video Editor"
                ].map((role, index) => (
                  <li key={index} className="flex items-center text-foreground text-lg font-nunito">
                    <span className="text-[#170961] font-bold mr-3 text-xl">✔</span>
                    {role}
                  </li>
                ))}
              </ul>
              
              <div className="text-center">
                <Button 
                  onClick={handleApplyNow}
                  variant="hero" 
                  size="lg"
                  className="w-full max-w-xs mx-auto bg-[#170961] hover:bg-[#1a0b70]"
                >
                  Apply Now
                </Button>
              </div>
            </Card>

            {/* We Are Hiring Image */}
            <div className="flex-1 flex justify-center lg:justify-start">
              <img 
                src={weAreHiring} 
                alt="We Are Hiring" 
                className="w-64 h-auto lg:mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Positions Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Detailed Position Descriptions</h2>
            <p className="text-xl text-muted-foreground font-nunito">Learn more about each role and its requirements</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {openPositions.map((position, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-smooth">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2 font-oswald">{position.title}</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-secondary text-foreground text-sm rounded-full font-nunito">
                      {position.department}
                    </span>
                    <span className="px-3 py-1 border border-border text-foreground text-sm rounded-full font-nunito">
                      {position.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 font-nunito">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {position.salary}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 font-nunito">{position.description}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-2 font-oswald">Requirements:</h4>
                  <ul className="space-y-1">
                    {position.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground font-nunito">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={handleApplyNow}
                  variant="hero" 
                  className="w-full bg-[#170961] hover:bg-[#1a0b70]"
                >
                  Apply Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Why Work With Us?</h2>
            <p className="text-xl text-muted-foreground font-nunito">Comprehensive benefits and a culture that values your growth</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-4 shadow-card text-center">
                <p className="text-sm font-medium text-foreground font-nunito">{benefit}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-oswald">Our Hiring Process</h2>
            <p className="text-xl text-muted-foreground font-nunito">What to expect when you apply</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Application", description: "Submit your resume and cover letter" },
              { step: "02", title: "Phone Screen", description: "Brief conversation about your background" },
              { step: "03", title: "Technical Interview", description: "Assess your technical skills and experience" },
              { step: "04", title: "Final Interview", description: "Meet the team and discuss culture fit" },
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
            Don't See a Perfect Match?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-nunito">
            We're always interested in talented individuals. Send us your resume and tell us how you'd like to contribute.
          </p>
          <Button 
            onClick={handleApplyNow}
            variant="hero" 
            size="lg" 
            className="bg-[#170961] hover:bg-[#1a0b70]"
          >
            Send Your Resume
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Careers;