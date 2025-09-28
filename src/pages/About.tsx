import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import group7 from "@/assets/Group 7.png";

const About = () => {
  return (
    <main className="pt-28">
      {/* About Us Section */}
      <section className="py-8 bg-background min-h-screen font-nunito">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-5 pt-[30px] pb-[60px] box-border">
          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.2rem] text-primary font-black text-center mb-[6px] font-oswald">
            About Us
          </h1>
          
          {/* Subtitle */}
          <div className="text-lg sm:text-xl lg:text-[1.1rem] text-foreground text-center mb-5 font-nunito px-4">
            We are a Software Development Company and Coding Institution<br className="hidden sm:block" />
            headquartered in Nigeria.
          </div>

          {/* What we do and image grid */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-[10px] mb-[25px]">
            {/* What we do */}
            <Card className="bg-card rounded-[15px] shadow-card p-6 sm:p-[25px] w-full lg:min-w-[450px] lg:max-w-[500px] lg:flex-[0_0_500px]">
              <div className="font-bold text-lg sm:text-[1.12rem] text-foreground mb-[12px] font-oswald">
                What we do:
              </div>
              <div className="text-base sm:text-[1rem] text-foreground leading-[1.7] font-nunito">
                Help thinkers and entrepreneurs bring their bold ideas to life.<br />
                Build, maintain, and scale world-class software solutions.<br />
                Train beginners into job-ready tech professionals.
              </div>
            </Card>
            
            {/* Single Image section */}
            <div className="flex justify-center items-center w-full lg:w-[420px] h-[200px] sm:h-[240px] lg:h-[240px] bg-card rounded-[10px] shadow-card lg:flex-[0_0_420px]">
              <img
                src={group7}
                alt="Group 7"
                className="w-[80%] h-auto rounded-[10px] block mx-auto"
              />
            </div>
          </div>

          {/* Mission and Vision */}
          <Card className="bg-accent/20 rounded-[16px] p-4 sm:p-5 shadow-card max-w-[550px] mx-auto mt-5">
            <div className="font-bold text-lg sm:text-[1.1rem] text-foreground mb-2 font-oswald">
              MISSION
            </div>
            <div className="text-sm sm:text-[0.95rem] text-foreground mb-4 leading-[1.6] font-nunito">
              To empower thinkers, businesses, and learners by building innovative software solutions and delivering world-class technology education that transforms ideas into scalable impact.
            </div>
            <div className="font-bold text-lg sm:text-[1.1rem] text-foreground mb-2 font-oswald">
              VISION
            </div>
            <div className="text-sm sm:text-[0.95rem] text-foreground leading-[1.6] font-nunito">
              To become Africa's leading tech powerhouse, blending innovation with education, nurturing talent, and driving sustainable growth in the global digital economy.
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default About;