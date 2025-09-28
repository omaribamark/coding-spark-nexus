import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import group39 from "@/assets/Group 39.png";

const Services = () => {
  const cardWidth = 240; // px
  const cardHeight = 230; // px

  return (
    <main className="pt-16">
      {/* Products & Services Section */}
      <section className="min-h-screen bg-white" style={{ fontFamily: "'Inter', Arial, sans-serif" }}>
        <div className="max-w-[1100px] mx-auto px-2 py-6 pb-10 relative">
          {/* Added pt-20 to move content down */}
          <div className="pt-20">
            {/* Title */}
            <h1 className="text-[2.7rem] text-[#170961] font-black text-center mb-[18px]"
                style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
              Product & Services
            </h1>
            
            {/* Subtitle */}
            <div className="text-[1.18rem] text-[#242424] text-center mb-[38px]">
              We offer varieties of products and services in our Software<br />
              development company
            </div>

            {/* Product Cards */}
            <div className="flex justify-center gap-14 mb-8 flex-wrap">
              {/* Software Development */}
              <div className="flex flex-col items-center m-0 box-border"
                   style={{ 
                     flex: `0 0 ${cardWidth}px`,
                     minWidth: `${cardWidth}px`,
                     maxWidth: `${cardWidth}px`,
                     height: `${cardHeight}px`
                   }}>
                <div className="font-bold text-[0.95rem] text-[#170961] border-2 border-[#170961] rounded-t-[9px] bg-white py-[3px] box-border w-full text-center mb-0"
                     style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
                  Software Development
                </div>
                <div className="bg-[#D3CCE6] rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-[0_4px_24px_rgba(36,36,36,0.07)] text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-[#242424] text-[0.83rem] leading-[1.9]">
                    Web Development<br />
                    Mobile Apps (iOS & Android)<br />
                    UI/UX Design<br />
                    Product Management & Maintenance
                  </div>
                </div>
              </div>
              
              {/* Tech Academy */}
              <div className="flex flex-col items-center m-0 box-border"
                   style={{ 
                     flex: `0 0 ${cardWidth}px`,
                     minWidth: `${cardWidth}px`,
                     maxWidth: `${cardWidth}px`,
                     height: `${cardHeight}px`
                   }}>
                <div className="font-bold text-[0.95rem] text-[#170961] border-2 border-[#170961] rounded-t-[9px] bg-white py-[3px] box-border w-full text-center mb-0"
                     style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
                  Tech Academy
                </div>
                <div className="bg-[#D3CCE6] rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-[0_4px_24px_rgba(36,36,36,0.07)] text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-[#242424] text-[0.83rem] leading-[1.9]">
                    Beginner to expert coding programs<br />
                    No-code Tools & AI Integration<br />
                    Mentorship + Hands-On Projects<br />
                    Internship & Job placement Support
                  </div>
                </div>
              </div>
              
              {/* Innovation Hub */}
              <div className="flex flex-col items-center m-0 box-border"
                   style={{ 
                     flex: `0 0 ${cardWidth}px`,
                     minWidth: `${cardWidth}px`,
                     maxWidth: `${cardWidth}px`,
                     height: `${cardHeight}px`
                   }}>
                <div className="font-bold text-[0.95rem] text-[#170961] border-2 border-[#170961] rounded-t-[9px] bg-white py-[3px] box-border w-full text-center mb-0"
                     style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
                  Innovation Hub
                </div>
                <div className="bg-[#D3CCE6] rounded-b-[15px] px-[10px] pt-[10px] pb-[8px] shadow-[0_4px_24px_rgba(36,36,36,0.07)] text-center w-full flex-1 flex flex-col justify-start">
                  <div className="text-[#242424] text-[0.83rem] leading-[1.9]">
                    Start-Up Consultation<br />
                    MVP(Minimum Viable Product) Building<br />
                    Growth & Scaling Support
                  </div>
                </div>
              </div>
            </div>

            {/* Special Programs Section */}
            <div className="mt-8">
              <div className="flex items-start gap-7 flex-wrap">
                {/* Text */}
                <div className="flex-1 min-w-[320px]" style={{ flexBasis: '370px' }}>
                  <h2 className="text-[#170961] font-bold text-[1.5rem] mb-4"
                      style={{ fontFamily: "'Montserrat', Arial, sans-serif" }}>
                    Special Programs
                  </h2>
                  <div className="text-[#242424] text-[1.08rem] leading-[1.7]">
                    We also extend our training to schools through our Coding & Robotics for Schools program. Introducing primary and secondary students to coding, robotics, and problem-solving early. If you're a school administrator or teacher reach out to us let's work together.
                  </div>
                </div>
                
                {/* Single Image */}
                <div className="flex flex-col items-center max-w-[440px] flex-1 self-start mt-0 pt-0"
                     style={{ flexBasis: '340px' }}>
                  <img
                    src={group39}
                    alt="Coding and robotics"
                    className="w-full h-[310px] object-cover rounded-[10px] shadow-[0_2px_12px_rgba(36,36,36,0.08)] mt-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Montserrat and Inter fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;500&display=swap');
      `}</style>
    </main>
  );
};

export default Services;