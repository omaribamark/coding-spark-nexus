import instagramIcon from "@/assets/ig.png";
import whatsappIcon from "@/assets/whatsapp.png";
import facebookIcon from "@/assets/facebook.png";
import newIcon from "@/assets/new.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-6">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="font-bold text-xl mb-2 font-oswald">Coding</div>
            <div className="font-nunito">CodingPlayGround Technologies</div>
          </div>

          {/* Social Media */}
          <div className="text-center">
            <div className="mb-3 font-nunito">Join our Community on</div>
            <div className="flex justify-center gap-3">
              {[
                { src: instagramIcon, alt: "Instagram", href: "#" },
                { src: facebookIcon, alt: "Facebook", href: "#" },
                { src: whatsappIcon, alt: "WhatsApp", href: "https://wa.me/" },
                { src: newIcon, alt: "New", href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/80 hover:bg-primary-glow rounded-lg w-8 h-8 flex items-center justify-center shadow-md transition-smooth"
                >
                  <img
                    src={social.src}
                    alt={social.alt}
                    className="w-4 h-4 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Website */}
          <div className="text-center md:text-right font-nunito">
            Website<br />
            <span className="underline">codingplayground.tech</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/30 w-full my-4" />

        {/* Copyright */}
        <div className="text-center font-nunito">
          ©2025 All rights reserved
        </div>
      </div>
    </footer>
  );
}