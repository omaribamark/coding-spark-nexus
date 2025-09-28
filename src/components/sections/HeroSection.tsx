import { Button } from "@/components/ui/button";
import networkLeft from "@/assets/6.png";
import networkRight from "@/assets/7.png";
import codingDecor from "@/assets/Coding PLayground (1) 1.png";
import arrowImg from "@/assets/5.png";
import whatsappIcon from "@/assets/Vector.svg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden font-nunito">
      {/* Background Network Decorations - REMOVED OPACITY */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={networkLeft}
          alt=""
          className="absolute left-0 bottom-0 w-60 sm:w-80 h-60 sm:h-80 z-1"  // REMOVED opacity-30
        />
        <img
          src={networkRight}
          alt=""
          className="absolute right-0 bottom-0 w-60 sm:w-80 h-60 sm:h-80 z-1"  // REMOVED opacity-30
        />
      </div>

      <div className="container relative z-3 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Increased pt-32 to pt-40 to move content down more */}
        <div className="max-w-4xl mx-auto text-center flex flex-col justify-center min-h-screen pt-32 sm:pt-40 pb-20">
          {/* Main Heading with Logo and Arrow */}
          <div className="relative inline-block mb-4">
            {/* Logo positioned to the left of first B in Building - hidden on mobile */}
            <img
              src={codingDecor}
              alt=""
              className="absolute -left-8 sm:-left-12 -top-6 sm:-top-10 w-16 h-16 sm:w-24 sm:h-24 z-4 hidden sm:block"
            />
            
            {/* Headline */}
            <h1 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight mb-0 tracking-tight text-primary font-oswald"
            >
              Building People. Building <span className="text-primary">Products</span>.<br />
              Building the Future.
            </h1>

            {/* Arrow image below "Products" - MOVED MORE TO THE RIGHT - hidden on mobile */}
            <div className="absolute left-64 sm:left-80 lg:left-96 xl:left-[46rem] top-12 sm:top-16 z-5 hidden sm:block">
              <img
                src={arrowImg}
                alt=""
                className="w-24 sm:w-36 lg:w-40 h-auto"
              />
            </div>
          </div>

          {/* Subtext */}
          <p 
            className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-4 sm:px-0 font-nunito"
          >
            We build, we train, we launch. At CodingPlayGround Technologies, we transform ideas into<br className="hidden sm:block" />
            <span className="whitespace-nowrap">world-class digital products</span> while empowering learners to become tech experts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center mb-8">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-medium text-base sm:text-lg min-w-[200px] shadow-elegant hover:shadow-glow transition-smooth font-nunito"
            >
              Start a Project
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-medium text-base sm:text-lg min-w-[200px] shadow-elegant hover:shadow-glow transition-smooth font-nunito"
            >
              Join our Academy
            </Button>
          </div>

          {/* WhatsApp CTA */}
          <div className="text-center mt-8 sm:mt-12 font-nunito">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-col items-center no-underline text-muted-foreground hover:text-foreground transition-smooth"
            >
              <img 
                src={whatsappIcon} 
                alt="WhatsApp" 
                className="h-10 w-10 sm:h-12 sm:w-12 mb-2 hover:scale-110 transition-transform" 
              />
              <span className="text-base sm:text-lg">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}