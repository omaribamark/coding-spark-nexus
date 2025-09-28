import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <main className="pt-16">
      {/* Training Programs Section */}
      <section className="min-h-screen bg-white" style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
        <div className="max-w-[1220px] mx-auto px-12 py-10 pb-5 relative">
          {/* Added pt-20 to move content down */}
          <div className="pt-20">
            {/* Page Title */}
            <h1 className="text-[2.7rem] text-[#170961] font-black text-center mb-[18px]"
                style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
              Training Programs
            </h1>
            
            {/* Subtitle */}
            <div className="text-[1.18rem] text-[#242424] text-center mb-[38px]"
                 style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
              Our Software development company offers training programs for future developers, Certificate & Internship Placement is guaranteed
            </div>

            {/* Roles grid */}
            <section>
              <div className="text-[#170961] font-bold text-[1.3rem] mb-[18px]"
                   style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                <span className="underline cursor-pointer">Roles</span> we train for
              </div>
              <div className="grid grid-cols-4 gap-[22px] mb-10">
                {rolesGrid.flat().map((role, idx) => (
                  <div
                    key={role.title}
                    className={`flex flex-col items-center font-medium text-[1.08rem] text-[#170961] min-w-0 border border-[#ECECEC] relative rounded-[15px] shadow-[0_4px_16px_rgba(36,36,36,0.08)] px-2 pt-8 pb-6 ${
                      role.highlight ? 'bg-[#E7E7FA]' : 'bg-white'
                    }`}
                    style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
                  >
                    <div className="mb-3">{role.icon}</div>
                    {role.title}
                    {/* Arrow icon to the right of Virtual Assistant */}
                    {role.title === "Virtual Assistant" && (
                      <img src={arrowIcon} alt="Arrow" className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 w-[38px] h-[38px]" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills you will learn section */}
            <section className="flex gap-8 mb-10 items-start">
              <div className="flex-1" style={{ flexBasis: '340px' }}>
                <div className="text-[#170961] font-bold text-[1.3rem] mb-[18px]"
                     style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                  <span className="underline cursor-pointer">Skills</span> you will learn
                </div>
                <ul className="text-[1.08rem] text-[#242424] mb-0 pl-0 list-none"
                    style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
                  {skills.map(skill => (
                    <li key={skill} className="mb-[14px] flex items-center">
                      <span className="text-[#170961] font-bold mr-[13px] text-[1.2rem]">✔</span> {skill}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Larger image, no certificate circle */}
              <div className="flex flex-col items-center justify-center max-w-[500px]">
                <img src={group27} alt="Skill" className="w-full h-[260px] object-cover rounded-[16px] shadow-[0_2px_12px_rgba(36,36,36,0.08)]" />
              </div>
            </section>

            {/* Languages and Tools */}
            <section>
              <div className="text-[#170961] font-bold text-[1.3rem] mb-[18px]"
                   style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                <span className="underline cursor-pointer">Languages</span> and Tools
              </div>
              <div className="w-full flex flex-col gap-5 mb-[18px] items-start pl-5">
                {toolsGrid.map((row, i) => {
                  return (
                    <div
                      key={i}
                      className="grid gap-[52px] justify-center max-w-full"
                      style={{ 
                        gridTemplateColumns: `repeat(${row.length}, 110px)`,
                        width: `calc(110px * ${row.length} + 52px * ${row.length - 1})`
                      }}
                    >
                      {row.map(tool => (
                        <div key={tool.name}
                          className="bg-white rounded-full w-[110px] h-[110px] flex flex-col items-center justify-center shadow-[0_2px_12px_rgba(36,36,36,0.08)] font-semibold text-[1rem] text-[#170961] mb-2"
                          style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
                        >
                          <img src={tool.icon} alt={tool.name} className="w-12 h-12 mb-2" />
                          <span>{tool.name}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex flex-row items-start mt-[38px] mb-0 min-h-[300px]">
              {/* No-Code Tools Section */}
              <div className="flex-1 relative">
                <div className="text-[#170961] font-bold text-[1.3rem] mb-[18px]"
                     style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                  <span className="underline cursor-pointer">No-Code Tools</span>
                </div>
                <div className="flex gap-[22px] mb-[38px]">
                  {nocode.map((tool) => (
                    <div key={tool.name}
                      className="bg-white rounded-full w-[110px] h-[110px] flex flex-col items-center justify-center shadow-[0_2px_12px_rgba(36,36,36,0.08)] font-semibold text-[1rem] text-[#170961]"
                      style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
                    >
                      <img src={tool.icon} alt={tool.name} className="w-12 h-12 mb-2 object-contain" />
                      <span>{tool.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Start Your Journey Today and Apply Now positioned horizontally */}
                <div className="flex items-start gap-8 mt-5 max-w-full">
                  <div className="flex-auto max-w-[350px]">
                    <h2 className="text-[#170961] font-bold text-[2rem] mb-[14px]"
                        style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                      Start Your<br />Journey Today!
                    </h2>
                    <div className="text-[#242424] text-[1.08rem] mb-[22px]"
                         style={{ fontFamily: "'Nunito', Arial, sans-serif" }}>
                      Apply now to kickstart your career with CodingPlayground Technology
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-end gap-4 flex-auto mt-20 ml-[120px]">
                    <Button 
                      className="bg-[#1A1064] hover:bg-[#1A1064]/90 text-white rounded-[12px] text-[1.1rem] font-medium px-12 py-4 shadow-[0_4px_16px_rgba(23,9,97,0.11)] cursor-pointer transition-all"
                      style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
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
                      className="bg-transparent text-[#242424] border-none text-[1rem] cursor-pointer no-underline py-1 ml-[150px]"
                      style={{ fontFamily: "'Nunito', Arial, sans-serif" }}
                    >
                      Back to the top
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Certificate Badge Section */}
              <div className="flex flex-col items-center justify-start min-w-[240px] relative"
                   style={{ flex: '0 0 320px' }}>
                <div className="relative w-[210px] h-[210px] mt-[18px] mb-6 block">
                  <img
                    src={certificateCircle}
                    alt="Certificate + Internship Placement Guaranteed"
                    className="w-[210px] h-[210px] block"
                  />
                  <div className="absolute top-11 left-0 w-[210px] text-center text-white font-bold pointer-events-none"
                       style={{ fontFamily: "'Oswald', Arial, sans-serif" }}>
                    <div className="text-[22px] leading-[1.1]">Certificate</div>
                    <div className="text-[18px] font-bold my-1.5">+</div>
                    <div className="text-[17px] font-bold leading-[1.1]">Internship Placement</div>
                    <div className="text-[17px] font-bold leading-[1.1]">Guaranteed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Oswald and Nunito fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Nunito:wght@400;500;600&display=swap');
      `}</style>
    </main>
  );
};

export default Training;