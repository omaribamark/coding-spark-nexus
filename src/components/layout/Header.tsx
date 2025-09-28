import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import codingLogo from "@/assets/Coding PLayground 1.png";

const navigationItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Product & Services", href: "/services" },
  { label: "Training Programs", href: "/training" },
  { label: "Our Team", href: "/team" },
  { label: "Careers", href: "/careers" },
  { label: "Partnership", href: "/partnership" },
  { label: "Contact Us", href: "/contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Increased height to accommodate larger logo */}
        <div className="flex items-center justify-between h-28">
          {/* Logo - much larger size to make it prominent */}
          <Link to="/" className="flex items-center">
            <img 
              src={codingLogo} 
              alt="CodingPlayGround" 
              className="h-20 w-auto"  // Using h-20 and w-auto to maintain aspect ratio
            />
          </Link>

          {/* Desktop Navigation - adjusted for larger navbar */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-5 py-4 text-base font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "text-[#2D1B69] bg-gray-100"
                    : "text-gray-700 hover:text-[#2D1B69] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-12 w-12"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-4 text-base font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "text-[#2D1B69] bg-gray-100"
                      : "text-gray-700 hover:text-[#2D1B69] hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}