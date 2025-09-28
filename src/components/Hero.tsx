import { Button } from "@/components/ui/button";
import networkLeft from "@/assets/network-left.png";
import networkRight from "@/assets/network-right.png";
import decorativeArrow from "@/assets/decorative-arrow.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Network Graphics */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4 opacity-30">
        <img 
          src={networkLeft} 
          alt="Network Decorative Left" 
          className="w-64 h-auto"
        />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-30">
        <img 
          src={networkRight} 
          alt="Network Decorative Right" 
          className="w-64 h-auto"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Decorative Arrow */}
          <div className="flex justify-center mb-8">
            <img 
              src={decorativeArrow} 
              alt="Decorative Arrow" 
              className="w-16 h-auto opacity-60"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 leading-tight">
            Building People. Building Products.
            <br />
            Building the Future.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            We build, we train, we launch. At CodingPlayGround Technologies, we transform ideas into
            <br />
            world-class digital products while empowering learners to become tech experts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Start a Project
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Join our Academy
            </Button>
          </div>

          {/* WhatsApp Contact */}
          <div className="flex justify-center">
            <a 
              href="https://wa.me/" 
              className="flex items-center gap-3 text-green-600 hover:text-green-700 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.384"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;