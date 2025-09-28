import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import group39 from "@/assets/Group 39.png";

const Services = () => {
  const cardWidth = 240; // px
  const cardHeight = 230; // px

  return (
    <main className="pt-28">
      {/* Products & Services Section */}
      <section className="min-h-screen bg-background font-inter">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 pb-10 relative">
          {/* Added pt-20 to move content down */}
          <div className="pt-12 sm:pt-20">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.7rem] text-primary font-black text-center mb-4 sm:mb-[18px] font-montserrat">
              Product & Services
            </h1>
            
            {/* Subtitle */}
            <div className="text-base sm:text-lg lg:text-[1.18rem] text-foreground text-center mb-8 sm:mb-[38px] px-4">
              We offer varieties of products and services in our Software<br className="hidden sm:block" />
              development company
            </div>

            {/* Product Cards */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 lg:gap-14 mb-8 items-center">
              {/* Software Development */}
              <div className="flex flex-col items-center m-0 box-border w-full max-w-[280px] sm:max-w-[240px] h-auto sm:h-[230px]">
                <div className="font-bold text-sm sm:text-[0.95rem] text-primary border-2 border-primary rounded-t-[9px] bg-card py-[3px] box-border w-full text-center mb-0 font-montserrat">
                  Software Development
                </div>
                <div className="bg-accent/20 rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-card text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-foreground text-xs sm:text-[0.83rem] leading-[1.7] sm:leading-[1.9]">
                    Web Development<br />
                    Mobile Apps (iOS & Android)<br />
                    UI/UX Design<br />
                    Product Management & Maintenance
                  </div>
                </div>
              </div>
              
              {/* Tech Academy */}
              <div className="flex flex-col items-center m-0 box-border w-full max-w-[280px] sm:max-w-[240px] h-auto sm:h-[230px]">
                <div className="font-bold text-sm sm:text-[0.95rem] text-primary border-2 border-primary rounded-t-[9px] bg-card py-[3px] box-border w-full text-center mb-0 font-montserrat">
                  Tech Academy
                </div>
                <div className="bg-accent/20 rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-card text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-foreground text-xs sm:text-[0.83rem] leading-[1.7] sm:leading-[1.9]">
                    Beginner to expert coding programs<br />
                    No-code Tools & AI Integration<br />
                    Mentorship + Hands-On Projects<br />
                    Internship & Job placement Support
                  </div>
                </div>
              </div>
              
              {/* Innovation Hub */}
              <div className="flex flex-col items-center m-0 box-border w-full max-w-[280px] sm:max-w-[240px] h-auto sm:h-[230px]">
                <div className="font-bold text-sm sm:text-[0.95rem] text-primary border-2 border-primary rounded-t-[9px] bg-card py-[3px] box-border w-full text-center mb-0 font-montserrat">
                  Innovation Hub
                </div>
                <div className="bg-accent/20 rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-card text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-foreground text-xs sm:text-[0.83rem] leading-[1.7] sm:leading-[1.9]">
                    Start-Up Consultation<br />
                    MVP(Minimum Viable Product) Building<br />
                    Growth & Scaling Support
                  </div>
                </div>
              </div>
            </div>

            {/* Special Programs Section */}
            <div className="mt-8">
              <div className="flex flex-col lg:flex-row items-start gap-6 sm:gap-7">
                {/* Text */}
                <div className="flex-1 min-w-full lg:min-w-[320px] order-2 lg:order-1">
                  <h2 className="text-primary font-bold text-xl sm:text-[1.5rem] mb-4 font-montserrat">
                    Special Programs
                  </h2>
                  <div className="text-foreground text-base sm:text-[1.08rem] leading-[1.6] sm:leading-[1.7]">
                    We also extend our training to schools through our Coding & Robotics for Schools program. Introducing primary and secondary students to coding, robotics, and problem-solving early. If you're a school administrator or teacher reach out to us let's work together.
                  </div>
                </div>
                
                {/* Single Image */}
                <div className="flex flex-col items-center max-w-full lg:max-w-[440px] flex-1 self-start mt-0 pt-0 order-1 lg:order-2">
                  <img
                    src={group39}
                    alt="Coding and robotics"
                    className="w-full max-w-[400px] lg:max-w-none h-[250px] sm:h-[310px] object-cover rounded-[10px] shadow-card mt-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Services;