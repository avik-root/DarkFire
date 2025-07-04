
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Languages, ShieldCheck, Cpu, Layers, DownloadCloud, Wand2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <Languages className="w-10 h-10 text-primary" />,
    title: "Multi-Language Support",
    description: "Generate payloads in Python, JavaScript, PowerShell, C++, Go, and more.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: "Diverse Payload Types",
    description: "Create reverse shells, keyloggers, ransomware, and other common payload types.",
  },
  {
    icon: <Cpu className="w-10 h-10 text-primary" />,
    title: "AI-Powered Customization",
    description: "Leverage AI to tailor functionality to your specific engagement requirements.",
  },
  {
    icon: <Layers className="w-10 h-10 text-primary" />,
    title: "Modular & Extensible",
    description: "Easily modify and extend generated code to fit unique scenarios.",
  },
  {
    icon: <DownloadCloud className="w-10 h-10 text-primary" />,
    title: "Easy Export",
    description: "Download your generated scripts with the correct file extensions, ready for use.",
  },
  {
    icon: <Wand2 className="w-10 h-10 text-primary" />,
    title: "Intuitive Interface",
    description: "A clean and developer-friendly UI to streamline your workflow.",
  },
];

const howItWorksSteps = [
  {
    step: 1,
    title: "Specify Requirements",
    description: "Select your desired language, payload type, and provide detailed specifications for the AI.",
  },
  {
    step: 2,
    title: "Generate Code",
    description: "Our AI engine processes your request and crafts the custom code in seconds.",
  },
  {
    step: 3,
    title: "Review & Deploy",
    description: "Download, review, and integrate the generated payload into your security assessment toolkit.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20 md:space-y-32">
      <section 
        className="text-center"
      >
        <div className="relative z-10 opacity-0 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary">
            Welcome to DarkFire
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Your AI-powered assistant for generating custom security scripts and payloads.
            {isAuthenticated
              ? " Head to the playground to start forging."
              : " Log in to create tailored code for your security assessments."}
          </p>
           <div className="mt-8">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href={isAuthenticated ? "/playground" : "/login"}>
                {isAuthenticated ? 'Go to the Playground' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5"/>
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <section id="features" className="space-y-12 opacity-0 animate-fade-in-up [animation-delay:200ms]">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-headline tracking-tighter">
            <span className="text-primary">Powerful</span> Features
          </h2>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-foreground/70">
            Everything you need for rapid payload development.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 hover:bg-card/80 hover:scale-105 transition-all duration-300">
              <CardHeader>
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                  </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="space-y-12 opacity-0 animate-fade-in-up [animation-delay:400ms]">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-headline tracking-tighter">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-foreground/70">
            Generate custom scripts in three simple steps.
          </p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
           <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block"></div>
           <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent -translate-y-1/2 hidden md:block animate-pulse"></div>

          {howItWorksSteps.map((step, index) => (
            <div key={index} className="relative z-10 flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-lg">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary mb-4">
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-headline mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}