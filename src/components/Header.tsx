import codingLogo from "@/assets/coding-logo.png";

const Header = () => {
  const menuItems = [
    "Home",
    "About Us", 
    "Product & Services",
    "Training Programs",
    "Our Team",
    "Careers",
    "Partnership",
    "Contact Us"
  ];

  return (
    <header className="w-full bg-background border-b border-border/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={codingLogo} 
              alt="Coding" 
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="lg:hidden p-2">
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="w-full h-0.5 bg-foreground"></span>
              <span className="w-full h-0.5 bg-foreground"></span>
              <span className="w-full h-0.5 bg-foreground"></span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;