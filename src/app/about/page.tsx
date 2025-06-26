
import { ShieldAlert, Users, Target, Github, Linkedin, Mail, Flame } from "lucide-react";
import Image from "next/image";
import ProfileCard from "@/components/profile-card";
import "@/components/ProfileCard.css";
import fs from 'fs/promises';
import path from 'path';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TeamMember = {
  name: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  hint: string;
  github?: string;
  linkedin?: string;
  email?: string;
};

async function getTeamMembers(): Promise<TeamMember[]> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'team.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Could not read team data:", error);
    return [];
  }
}


export default async function AboutPage({}: {}) {
  const teamMembers = await getTeamMembers();

  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary">About DarkFire <span className="text-3xl md:text-5xl text-foreground/80">by MintFire</span></h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          DarkFire is a premier web application from the creators at MintFire. We are a team of cybersecurity experts and AI researchers dedicated to revolutionizing the way security professionals approach their work. DarkFire was born from a simple idea: what if we could harness AI to augment human intuition and accelerate security operations?
        </p>
      </section>

      <section className="max-w-4xl mx-auto">
        <Card className="bg-card/60 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/10">
          <CardHeader className="items-center text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-3">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline tracking-tight">About MintFire</CardTitle>
            <CardDescription className="text-muted-foreground">The Power Behind the Fire</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg text-foreground/80">
              MintFire is a next-generation software development company focused on delivering expert solutions in Cybersecurity, Web3 technologies, and Blockchain innovation. We engineer cutting-edge, secure, and scalable solutions to empower businesses and individuals in the evolving decentralized digital landscape.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-headline tracking-tighter">Our <span className="text-primary">Mission</span></h2>
          <p className="mt-4 text-lg text-foreground/70">
            Our mission is to empower security teams with cutting-edge, AI-driven tools that are both powerful and ethical. We believe that by automating the creation of custom security scripts, we can free up valuable time for professionals to focus on higher-level strategy, threat analysis, and defense.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full mt-1">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Innovation</h3>
                <p className="text-sm text-muted-foreground">Continuously advancing the state of AI in cybersecurity.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full mt-1">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Responsibility</h3>
                <p className="text-sm text-muted-foreground">Promoting ethical use and providing tools for defense.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full mt-1">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">Empowerment</h3>
                <p className="text-sm text-muted-foreground">Giving security professionals the tools they need to succeed.</p>
              </div>
            </div>
          </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <Card className="bg-destructive/10 border-destructive/30">
          <CardHeader className="text-center items-center">
            <ShieldAlert className="w-10 h-10 text-destructive mb-3"/>
            <CardTitle className="text-3xl font-headline tracking-tighter text-destructive">Ethical Use & Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-destructive-foreground/80 space-y-4 text-center">
            <p>
              DarkFire is designed exclusively for authorized security professionals, penetration testers, and educational purposes. Its function is to generate custom security scripts for controlled environments to identify vulnerabilities and improve defenses.
            </p>
            <p className="font-semibold">
              Misuse of this tool for malicious activities or on systems for which you do not have explicit, written consent is strictly prohibited and illegal.
            </p>
            <p>
              The creators of DarkFire and MintFire are not responsible for any misuse of the generated code. Users are solely responsible for their actions and must comply with all applicable laws.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-headline tracking-tighter">Meet The <span className="text-primary">Team</span></h2>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-foreground/70">
            The architects behind the fire.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 justify-items-center lg:max-w-4xl mx-auto">
          {teamMembers.map((member) => (
             <div key={member.name} className="flex flex-col items-center gap-4 w-full">
                <ProfileCard
                  name={member.name}
                  title={member.role}
                  avatarUrl={member.avatar}
                  dataAiHint={member.hint}
                />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-1">View Profile</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-sm text-foreground border-border/50">
                        <DialogHeader className="items-center text-center">
                          <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <DialogTitle className="text-3xl font-headline">{member.name}</DialogTitle>
                          <DialogDescription className="text-primary text-lg">{member.role}</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-center text-muted-foreground">{member.bio}</p>
                        </div>
                        <DialogFooter className="justify-center sm:justify-center">
                            <div className="flex items-center gap-4">
                              {member.github && (
                                <a href={member.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="p-2 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors">
                                  <Github />
                                </a>
                              )}
                              {member.linkedin && (
                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" className="p-2 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors">
                                  <Linkedin />
                                </a>
                              )}
                              {member.email && (
                                <a href={`mailto:${member.email}`} aria-label="Email" className="p-2 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors">
                                  <Mail />
                                </a>
                              )}
                            </div>
                        </DialogFooter>
                      </DialogContent>
                </Dialog>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
}
