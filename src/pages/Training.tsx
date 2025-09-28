import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import group27 from "@/assets/Group 27.png";
import webflowIcon from "@/assets/image 10.png";
import bubbleIcon from "@/assets/image 11.png";
import zapierIcon from "@/assets/image 12.png";
import certificateCircle from "@/assets/Star 1.png";

// Role icon imports
import fullstackIcon from "@/assets/Layer_1.png";
import mobileIcon from "@/assets/Frame.png";
import backendIcon from "@/assets/layer2.png";
import frontendIcon from "@/assets/svg8.png";
import securityIcon from "@/assets/Icons.png";
import devopsIcon from "@/assets/devops.png";
import uiuxIcon from "@/assets/uiux.png";
import nocodeIcon from "@/assets/no code.png";
import productManagerIcon from "@/assets/product manager.png";
import marketingIcon from "@/assets/digital marketing.png";
import videoEditingIcon from "@/assets/video editing.png";
import virtualAssistantIcon from "@/assets/virtual assistant.png";
import arrowIcon from "@/assets/arrow.png";

// Role icons mapping
const roleIcons = {
  fullstack: <img src={fullstackIcon} alt="Full Stack Developer" className="w-[38px] h-[38px]" />,
  mobile: <img src={mobileIcon} alt="Mobile App Developer" className="w-[38px] h-[38px]" />,
  backend: <img src={backendIcon} alt="Backend Engineer" className="w-[38px] h-[38px]" />,
  frontend: <img src={frontendIcon} alt="Frontend Engineer" className="w-[38px] h-[38px]" />,
  security: <img src={securityIcon} alt="Cyber Security Expert" className="w-[38px] h-[38px]" />,
  devops: <img src={devopsIcon} alt="DevOps Engineer" className="w-[38px] h-[38px]" />,
  uiux: <img src={uiuxIcon} alt="UI/UX Designer" className="w-[38px] h-[38px]" />,
  nocode: <img src={nocodeIcon} alt="No-Code Developer" className="w-[38px] h-[38px]" />,
  pm: <img src={productManagerIcon} alt="Product Manager" className="w-[38px] h-[38px]" />,
  marketing: <img src={marketingIcon} alt="Digital Marketing" className="w-[38px] h-[38px]" />,
  video: <img src={videoEditingIcon} alt="Video Editing" className="w-[38px] h-[38px]" />,
  va: <img src={virtualAssistantIcon} alt="Virtual Assistant" className="w-[38px] h-[38px]" />,
};

const rolesGrid = [
  [
    { title: "Full Stack Developer", icon: roleIcons.fullstack, highlight: false },
    { title: "Mobile App Developer", icon: roleIcons.mobile, highlight: true },
    { title: "Backend Engineer", icon: roleIcons.backend, highlight: false },
    { title: "Frontend Engineer", icon: roleIcons.frontend, highlight: true },
  ],
  [
    { title: "Cyber Security Expert", icon: roleIcons.security, highlight: true },
    { title: "DevOps Engineer", icon: roleIcons.devops, highlight: false },
    { title: "UI/UX Designer", icon: roleIcons.uiux, highlight: true },
    { title: "No-Code Developer", icon: roleIcons.nocode, highlight: false },
  ],
  [
    { title: "Product Manager", icon: roleIcons.pm, highlight: false },
    { title: "Digital Marketing", icon: roleIcons.marketing, highlight: true },
    { title: "Video Editing", icon: roleIcons.video, highlight: false },
    { title: "Virtual Assistant", icon: roleIcons.va, highlight: true },
  ]
];

const skills = [
  "Problem Solving & Logic Building",
  "System Design & Architecture",
  "Team Collaboration & Agile Development",
  "Resume Crafting & Career Prep",
];

const toolIcons = {
  html: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  css: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  js: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  angular: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
  vue: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  node: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  express: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  django: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg",
  flask: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  spring: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
  csharp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  dotnet: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg",
  sql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  postgres: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  mongodb: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  git: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  github: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  rust: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg"
};

const toolsGrid = [
  [
    { name: "HTML", icon: toolIcons.html },
    { name: "CSS", icon: toolIcons.css },
    { name: "JavaScript", icon: toolIcons.js },
    { name: "React", icon: toolIcons.react },
    { name: "Angular", icon: toolIcons.angular },
    { name: "Vue", icon: toolIcons.vue }
  ],
  [
    { name: "Node JS", icon: toolIcons.node },
    { name: "Express", icon: toolIcons.express },
    { name: "Python", icon: toolIcons.python },
    { name: "Django", icon: toolIcons.django },
    { name: "Flask", icon: toolIcons.flask },
    { name: "Java", icon: toolIcons.java }
  ],
  [
    { name: "Spring Boot", icon: toolIcons.spring },
    { name: "C#", icon: toolIcons.csharp },
    { name: ".Net", icon: toolIcons.dotnet },
    { name: "SQL", icon: toolIcons.sql },
    { name: "PostgreSQL", icon: toolIcons.postgres },
    { name: "MongoDB", icon: toolIcons.mongodb }
  ],
  [
    { name: "Git", icon: toolIcons.git },
    { name: "GitHub", icon: toolIcons.github },
    { name: "Rust", icon: toolIcons.rust },
    { name: "GO", icon: toolIcons.go }
  ]
];

const nocode = [
  { name: "Webflow", icon: webflowIcon },
  { name: "Bubble", icon: bubbleIcon },
  { name: "Zapier", icon: zapierIcon },
];

const Training = () => {
  return (
    <main className="pt-28">
      {/* Training Programs Section */}
      <section className="min-h-screen bg-background font-nunito">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-12 py-10 pb-5 relative">
          {/* Added pt-20 to move content down */}
          <div className="pt-12 sm:pt-20">
            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.7rem] text-primary font-black text-center mb-4 sm:mb-[18px] font-oswald">
              Training Programs
            </h1>
            
            {/* Subtitle */}
            <div className="text-base sm:text-lg lg:text-[1.18rem] text-foreground text-center mb-8 sm:mb-[38px] px-4 font-nunito">
              Our Software development company offers training programs for future developers, Certificate & Internship Placement is guaranteed
            </div>

            {/* Roles grid */}
            <section>
              <div className="text-primary font-bold text-lg sm:text-xl lg:text-[1.3rem] mb-4 sm:mb-[18px] font-oswald">
                <span className="underline cursor-pointer">Roles</span> we train for
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-[22px] mb-10">
                {rolesGrid.flat().map((role, idx) => (
                  <div
                    key={role.title}
                    className={`flex flex-col items-center font-medium text-base sm:text-lg lg:text-[1.08rem] text-primary min-w-0 border border-border relative rounded-[15px] shadow-card px-2 pt-6 sm:pt-8 pb-4 sm:pb-6 ${
                      role.highlight ? 'bg-accent/20' : 'bg-card'
                    }`}
                  >
                    <div className="mb-3">{role.icon}</div>
                    <span className="text-center leading-tight">{role.title}</span>
                    {/* Arrow icon to the right of Virtual Assistant - hidden on mobile */}
                    {role.title === "Virtual Assistant" && (
                      <img src={arrowIcon} alt="Arrow" className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 w-[38px] h-[38px] hidden lg:block" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills you will learn section */}
            <section className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-10 items-start">
              <div className="flex-1 order-2 lg:order-1">
                <div className="text-primary font-bold text-lg sm:text-xl lg:text-[1.3rem] mb-4 sm:mb-[18px] font-oswald">
                  <span className="underline cursor-pointer">Skills</span> you will learn
                </div>
                <ul className="text-base sm:text-lg lg:text-[1.08rem] text-foreground mb-0 pl-0 list-none font-nunito">
                  {skills.map(skill => (
                    <li key={skill} className="mb-3 sm:mb-[14px] flex items-center">
                      <span className="text-primary font-bold mr-3 sm:mr-[13px] text-lg sm:text-[1.2rem]">✔</span> {skill}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Larger image, no certificate circle */}
              <div className="flex flex-col items-center justify-center max-w-full lg:max-w-[500px] order-1 lg:order-2">
                <img src={group27} alt="Skill" className="w-full max-w-[400px] lg:max-w-none h-[200px] sm:h-[260px] object-cover rounded-[16px] shadow-card" />
              </div>
            </section>

            {/* Languages and Tools */}
            <section>
              <div className="text-primary font-bold text-lg sm:text-xl lg:text-[1.3rem] mb-4 sm:mb-[18px] font-oswald">
                <span className="underline cursor-pointer">Languages</span> and Tools
              </div>
              <div className="w-full flex flex-col gap-4 sm:gap-5 mb-4 sm:mb-[18px] items-center lg:items-start lg:pl-5">
                {toolsGrid.map((row, i) => {
                  return (
                    <div
                      key={i}
                      className="flex flex-wrap gap-4 sm:gap-8 lg:gap-[52px] justify-center lg:justify-start max-w-full"
                    >
                      {row.map(tool => (
                        <div key={tool.name}
                          className="bg-card rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-[110px] lg:h-[110px] flex flex-col items-center justify-center shadow-card font-semibold text-xs sm:text-sm lg:text-[1rem] text-primary mb-2 font-nunito"
                        >
                          <img src={tool.icon} alt={tool.name} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-1 lg:mb-2" />
                          <span className="text-center leading-tight">{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-col lg:flex-row items-start mt-8 sm:mt-[38px] mb-0 min-h-[300px] gap-8">
              {/* No-Code Tools Section */}
              <div className="flex-1 relative order-2 lg:order-1">
                <div className="text-primary font-bold text-lg sm:text-xl lg:text-[1.3rem] mb-4 sm:mb-[18px] font-oswald">
                  <span className="underline cursor-pointer">No-Code Tools</span>
                </div>
                <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-[22px] mb-8 sm:mb-[38px] justify-center lg:justify-start">
                  {nocode.map((tool) => (
                    <div key={tool.name}
                      className="bg-card rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-[110px] lg:h-[110px] flex flex-col items-center justify-center shadow-card font-semibold text-xs sm:text-sm lg:text-[1rem] text-primary font-nunito"
                    >
                      <img src={tool.icon} alt={tool.name} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 mb-1 lg:mb-2 object-contain" />
                      <span className="text-center">{tool.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Start Your Journey Today and Apply Now positioned horizontally */}
                <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-8 mt-5 max-w-full">
                  <div className="flex-auto max-w-full lg:max-w-[350px]">
                    <h2 className="text-primary font-bold text-xl sm:text-2xl lg:text-[2rem] mb-3 sm:mb-[14px] font-oswald leading-tight">
                      Start Your<br />Journey Today!
                    </h2>
                    <div className="text-foreground text-base sm:text-lg lg:text-[1.08rem] mb-6 sm:mb-[22px] font-nunito">
                      Apply now to kickstart your career with CodingPlayground Technology
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-end gap-4 flex-auto mt-4 lg:mt-20 lg:ml-[120px]">
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[12px] text-base sm:text-lg lg:text-[1.1rem] font-medium px-8 sm:px-12 py-3 sm:py-4 shadow-elegant cursor-pointer transition-smooth font-nunito"
                    >
                      Apply Now
                    </Button>
                    <button 
                      onClick={() => {
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }}
                      className="bg-transparent text-foreground border-none text-sm sm:text-base lg:text-[1rem] cursor-pointer no-underline py-1 lg:ml-[150px] font-nunito"
                    >
                      Back to the top
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Certificate Badge Section */}
              <div className="flex flex-col items-center justify-start min-w-full lg:min-w-[240px] relative order-1 lg:order-2 lg:flex-[0_0_320px]">
                <div className="relative w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] mt-4 sm:mt-[18px] mb-6 block">
                  <img
                    src={certificateCircle}
                    alt="Certificate + Internship Placement Guaranteed"
                    className="w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] block"
                  />
                  <div className="absolute top-8 sm:top-11 left-0 w-[180px] sm:w-[210px] text-center text-white font-bold pointer-events-none font-oswald">
                    <div className="text-lg sm:text-[22px] leading-[1.1]">Certificate</div>
                    <div className="text-base sm:text-[18px] font-bold my-1 sm:my-1.5">+</div>
                    <div className="text-sm sm:text-[17px] font-bold leading-[1.1]">Internship Placement</div>
                    <div className="text-sm sm:text-[17px] font-bold leading-[1.1]">Guaranteed</div>
                  </div>
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

export default Training;