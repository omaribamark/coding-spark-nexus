import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Github, Twitter } from "lucide-react";

// Profile images (you'll need to update these paths to match your actual images)
import directorImg from "../assets/Group 29.png";
import frontendImg from "../assets/Mask group.png";
import designerImg from "../assets/Mask group1.png";
import backendImg from "../assets/Mask group2.png";

// Social icon images
import whatsappIcon from "../assets/whatsapp icon.png";
import linkedinIcon from "../assets/linkedin icon.png";
import instagramIcon from "../assets/instagram icon.png";

const Team = () => {
  const teamMembers = [
    {
      name: "Eunice Nzilani",
      role: "Lead Frontend Developer",
      bio: "Frontend specialist with expertise in modern web technologies and user experience.",
      image: frontendImg,
      social: { linkedin: "#", github: "#", twitter: "#" }
    },
    {
      name: "Mariam Tajudeen",
      role: "Lead UI/UX Designer",
      bio: "Creative designer passionate about creating intuitive and beautiful user experiences.",
      image: designerImg,
      social: { linkedin: "#", github: "#", twitter: "#" }
    },
    {
      name: "Wycliffe Kibet",
      role: "Lead Backend Developer",
      bio: "Backend architect with expertise in scalable systems and cloud infrastructure.",
      image: backendImg,
      social: { linkedin: "#", github: "#", twitter: "#" }
    }
  ];

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-oswald">
              Meet <span className="bg-gradient-primary bg-clip-text text-transparent">Our Team</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-nunito font-semibold">
              We are builders, dreamers, and mentors.
            </p>
          </div>
        </div>
      </section>

      {/* Director Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 justify-center">
              {/* Director Image */}
              <div className="relative flex-shrink-0">
                <div className="relative">
                  <img
                    src={directorImg}
                    alt="Director"
                    className="w-60 h-60 object-cover rounded-full shadow-lg"
                  />
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-[#170961] font-semibold font-oswald text-lg rounded-lg px-5 py-2 shadow-lg border-2 border-[#170961] whitespace-nowrap text-center">
                    Director & Founder
                  </div>
                </div>
              </div>

              {/* Director Info */}
              <div className="flex-1 max-w-2xl text-left">
                <h2 className="text-2xl font-bold text-[#170961] mb-4 font-oswald">
                  Anakhe Ajayi
                </h2>
                <p className="text-foreground text-lg leading-relaxed mb-6 font-nunito">
                  Director of CodingPlayGround Technologies, I'm passionate about transforming ideas into scalable tech solutions. With experience in software development, product management, and startup consulting, I've led projects that bridge innovation and impact. At CodingPlayGround, my mission is to empower businesses and train the next generation of tech experts.
                </p>
                
                {/* Social icons */}
                <div className="flex gap-4 justify-start items-center">
                  <img 
                    src={instagramIcon} 
                    alt="Instagram" 
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                  <img 
                    src={whatsappIcon} 
                    alt="WhatsApp" 
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                  <img 
                    src={linkedinIcon} 
                    alt="LinkedIn" 
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <hr className="border-t-2 border-gray-300" />
      </div>

      {/* Team Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-smooth group text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-36 h-36 rounded-full mx-auto mb-4 object-cover shadow-md group-hover:border-primary transition-smooth"
                />
                <h3 className="text-xl font-bold text-foreground mb-1 font-oswald">{member.name}</h3>
                <p className="text-primary font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-nunito">{member.bio}</p>
                
                <div className="flex justify-center space-x-3">
                  <a
                    href={member.social.linkedin}
                    className="p-2 text-muted-foreground hover:text-primary transition-smooth"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.github}
                    className="p-2 text-muted-foreground hover:text-primary transition-smooth"
                    aria-label={`${member.name} GitHub`}
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={member.social.twitter}
                    className="p-2 text-muted-foreground hover:text-primary transition-smooth"
                    aria-label={`${member.name} Twitter`}
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Join Our Team?</h2>
            <p className="text-xl text-muted-foreground">We believe in fostering a culture of growth and innovation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Growth Opportunities",
                description: "Continuous learning and career advancement in a rapidly evolving tech landscape."
              },
              {
                title: "Work-Life Balance",
                description: "Flexible schedules and remote work options to maintain a healthy balance."
              },
              {
                title: "Innovation Culture",
                description: "Freedom to experiment with new technologies and contribute innovative ideas."
              },
              {
                title: "Collaborative Environment",
                description: "Work with passionate professionals who support each other's success."
              },
              {
                title: "Competitive Benefits",
                description: "Comprehensive benefits package including health, dental, and retirement plans."
              },
              {
                title: "Impact-Driven Work",
                description: "Build products and train students that make a real difference in people's lives."
              }
            ].map((benefit, index) => (
              <Card key={index} className="p-6 shadow-card">
                <h4 className="text-lg font-semibold text-foreground mb-3">{benefit.title}</h4>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Join Us?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for technology and education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">View Open Positions</Button>
            <Button variant="outline" size="lg">Send Your Resume</Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Team;