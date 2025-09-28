import { Button } from "@/components/ui/button";
import networkLeft from "@/assets/6.png";
import networkRight from "@/assets/7.png";
import codingDecor from "@/assets/Coding PLayground (1) 1.png";
import arrowImg from "@/assets/5.png";
import whatsappIcon from "@/assets/Vector.svg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden" style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
      {/* Background Network Decorations - REMOVED OPACITY */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={networkLeft}
          alt=""
          className="absolute left-0 bottom-0 w-80 h-80 z-1"  // REMOVED opacity-30
        />
        <img
          src={networkRight}
          alt=""
          className="absolute right-0 bottom-0 w-80 h-80 z-1"  // REMOVED opacity-30
        />
      </div>

      <div className="container relative z-3 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Increased pt-32 to pt-40 to move content down more */}
        <div className="max-w-4xl mx-auto text-center flex flex-col justify-center min-h-screen pt-40 pb-20">
          {/* Main Heading with Logo and Arrow */}
          <div className="relative inline-block mb-4">
            {/* Logo positioned to the left of first B in Building */}
            <img
              src={codingDecor}
              alt=""
              className="absolute -left-12 -top-10 w-24 h-24 z-4"
            />
            
            {/* Headline */}
            <h1 
              className="text-4xl lg:text-5xl font-black leading-tight mb-0 tracking-tight"
              style={{ 
                color: '#170961',
                fontFamily: "'Oswald', Arial, sans-serif",
                lineHeight: '1.15'
              }}
            >
              Building People. Building <span className="text-[#170961]">Products</span>.<br />
              Building the Future.
            </h1>

            {/* Arrow image below "Products" - MOVED MORE TO THE RIGHT */}
            <div className="absolute left-96 lg:left-[46rem] top-16 z-5">
              <img
                src={arrowImg}
                alt=""
                className="w-36 lg:w-40 h-auto"
              />
            </div>
          </div>

          {/* Subtext */}
          <p 
            className="text-xl text-gray-800 mb-10 leading-relaxed"
            style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
          >
            We build, we train, we launch. At CodingPlayGround Technologies, we transform ideas into<br />
            <span className="whitespace-nowrap">world-class digital products</span> while empowering learners to become tech experts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center mb-8">
            <Button 
              className="bg-[#170961] hover:bg-[#170961]/90 text-white px-10 py-4 rounded-2xl font-medium text-lg min-w-[200px] shadow-lg hover:shadow-xl transition-all"
              style={{ 
                borderRadius: '15px',
                fontFamily: "'Nunito', Arial, sans-serif",
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              Start a Project
            </Button>
            <Button 
              className="bg-[#170961] hover:bg-[#170961]/90 text-white px-10 py-4 rounded-2xl font-medium text-lg min-w-[200px] shadow-lg hover:shadow-xl transition-all"
              style={{ 
                borderRadius: '15px',
                fontFamily: "'Nunito', Arial, sans-serif",
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
            >
              Join our Academy
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <div className="text-center mt-12" style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center no-underline text-gray-800 hover:text-gray-700 transition-colors"
            >
              <img 
                src={whatsappIcon} 
                alt="WhatsApp" 
                className="h-12 w-12 mb-2 hover:scale-110 transition-transform" 
              />
              <span className="text-lg">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Add Oswald and Nunito fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@900&family=Nunito:wght@400;500;600&display=swap');
      `}</style>
    </section>
  );
}