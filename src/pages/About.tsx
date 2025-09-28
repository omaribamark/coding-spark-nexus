import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import group7 from "@/assets/Group 7.png";

const About = () => {
  return (
    <main className="pt-16">
      {/* About Us Section */}
      <section className="py-8 bg-white min-h-screen" style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
        <div className="max-w-[1100px] mx-auto px-5 pt-[30px] pb-[60px] box-border">
          {/* Page Title */}
          <h1 className="text-[2.2rem] text-[#170961] font-black text-center mb-[6px]"
              style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
            About Us
          </h1>
          
          {/* Subtitle */}
          <div className="text-[1.1rem] text-[#242424] text-center mb-5"
               style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
            We are a Software Development Company and Coding Institution<br />
            headquartered in Nigeria.
          </div>

          {/* What we do and image grid */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-[10px] mb-[25px]">
            {/* What we do */}
            <Card className="bg-white rounded-[15px] shadow-[0_8px_32px_rgba(36,36,36,0.15)] p-[25px] min-w-[450px] max-w-[500px] flex-[0_0_500px]">
              <div className="font-bold text-[1.12rem] text-[#242424] mb-[12px]"
                   style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                What we do:
              </div>
              <div className="text-[1rem] text-[#242424] leading-[1.7]"
                   style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
                Help thinkers and entrepreneurs bring their bold ideas to life.<br />
                Build, maintain, and scale world-class software solutions.<br />
                Train beginners into job-ready tech professionals.
              </div>
            </Card>
            
            {/* Single Image section */}
            <div className="flex justify-center items-center w-[420px] h-[240px] bg-white rounded-[10px] shadow-[0_2px_8px_rgba(36,36,36,0.09)] flex-[0_0_420px]">
              <img
                src={group7}
                alt="Group 7"
                className="w-[80%] h-auto rounded-[10px] block mx-auto"
              />
            </div>
          </div>

          {/* Mission and Vision */}
          <Card className="bg-[#D3CCE6] rounded-[16px] p-5 shadow-[0_8px_32px_rgba(36,36,36,0.12)] max-w-[550px] mx-auto mt-5">
            <div className="font-bold text-[1.1rem] text-[#242424] mb-2"
                 style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
              MISSION
            </div>
            <div className="text-[0.95rem] text-[#242424] mb-4 leading-[1.6]"
                 style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
              To empower thinkers, businesses, and learners by building innovative software solutions and delivering world-class technology education that transforms ideas into scalable impact.
            </div>
            <div className="font-bold text-[1.1rem] text-[#242424] mb-2"
                 style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
              VISION
            </div>
            <div className="text-[0.95rem] text-[#242424] leading-[1.6]"
                 style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
              To become Africa's leading tech powerhouse, blending innovation with education, nurturing talent, and driving sustainable growth in the global digital economy.
            </div>
          </Card>
        </div>
      </section>


      {/* Add Oswald and Nunito fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@900&family=Nunito:wght@400;500;600&display=swap');
      `}</style>
    </main>
  );
};

export default About;