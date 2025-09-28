import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Icon imports
import headOfficeIcon from "../assets/head office.png";
import emailIcon from "../assets/email.png";
import contactUsIcon from "../assets/contact us.png";
import instagramIcon from "../assets/ig.png";
import whatsappIcon from "../assets/whatsapp.png";
import facebookIcon from "../assets/facebook.png";
import newIcon from "../assets/new.png";

const Contact = () => {
  // Form state
  const [form, setForm] = useState({ name: "", subject: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent!");
    setForm({ name: "", subject: "", message: "" });
  };

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-oswald">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-nunito font-semibold">
              CodingPlayGround Technologies is ready to provide the right solution according to your needs
            </p>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Get In Touch Card */}
            <Card className="p-8 shadow-card hover:shadow-elegant transition-smooth">
              <h2 className="text-2xl font-bold text-[#170961] mb-6 font-oswald">
                Get In Touch
              </h2>
              
              {/* Head Office */}
              <div className="flex items-start mb-6">
                <img 
                  src={headOfficeIcon} 
                  alt="Head Office" 
                  className="w-10 h-10 mr-4 rounded-full shadow-md flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-[#170961] text-lg font-oswald">Head Office</h3>
                  <p className="text-foreground font-nunito">
                    Heritage Plaza, No. 30 S.N Okoronkwo, Kubwa,<br />
                    Federal Capital Territory, Abuja
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center mb-6">
                <img 
                  src={emailIcon} 
                  alt="Email" 
                  className="w-10 h-10 mr-4 rounded-full shadow-md flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-[#170961] text-lg font-oswald">Email Us</h3>
                  <p className="text-foreground font-nunito">info@codingplayground.tech</p>
                </div>
              </div>

              {/* Call Us */}
              <div className="flex items-center">
                <img 
                  src={contactUsIcon} 
                  alt="Call Us" 
                  className="w-10 h-10 mr-4 rounded-full shadow-md flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-[#170961] text-lg font-oswald">Call Us</h3>
                  <p className="text-foreground font-nunito">
                    Phone: +234 904 2512 356<br />
                    WhatsApp: +234 904 2512 356
                  </p>
                </div>
              </div>
            </Card>

            {/* Message Us Form */}
            <Card className="p-8 shadow-card hover:shadow-elegant transition-smooth">
              <h2 className="text-2xl font-bold text-[#170961] mb-6 font-oswald">
                Message Us
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="font-oswald text-foreground mb-2 block">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="font-nunito"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="font-oswald text-foreground mb-2 block">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="font-nunito"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="font-oswald text-foreground mb-2 block">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="font-nunito"
                    placeholder="Your message here..."
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  className="w-full bg-[#170961] hover:bg-[#1a0b70] font-nunito font-semibold"
                >
                  Send
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#170961] text-white py-8 mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-6">
            {/* Company Info */}
            <div>
              <div className="font-bold text-xl mb-2 font-oswald">Coding</div>
              <div className="font-nunito">CodingPlayGround Technologies</div>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <div className="mb-3 font-nunito">Join our Community on</div>
              <div className="flex justify-center gap-3">
                {[
                  { src: instagramIcon, alt: "Instagram" },
                  { src: facebookIcon, alt: "Facebook" },
                  { src: whatsappIcon, alt: "WhatsApp" },
                  { src: newIcon, alt: "New" }
                ].map((social, index) => (
                  <div
                    key={index}
                    className="bg-[#170961] rounded-lg w-8 h-8 flex items-center justify-center shadow-md"
                  >
                    <img
                      src={social.src}
                      alt={social.alt}
                      className="w-4 h-4 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Website */}
            <div className="text-right font-nunito">
              Website<br />
              <span className="underline">codingplayground.tech</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/30 w-full my-4" />

          {/* Copyright */}
          <div className="text-center font-nunito">
            ©2025 All rights reserved
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Contact;