
import { ShieldAlert, Users, Target, Github, Linkedin, Mail } from "lucide-react";
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
    <div className="space-y-16 opacity-0 animate-fade-in-up">
      <section className="text-center">
        <h1 className="text-5xl md:text-7xl font-headline tracking-tighter text-primary">About DarkFire</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          We are a team of cybersecurity experts and AI researchers dedicated to revolutionizing the way security professionals approach their work. DarkFire was born from a simple idea: what if we could harness AI to augment human intuition and accelerate security operations?
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-4xl font-headline tracking-tighter">Our <span className="text-primary">Mission</span></h2>
          <p className="text-foreground/70">
            Our mission is to empower security teams with cutting-edge, AI-driven tools that are both powerful and ethical. We believe that by automating the creation of custom security scripts, we can free up valuable time for professionals to focus on higher-level strategy, threat analysis, and defense.
          </p>
          <div className="flex flex-col space-y-4 pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Innovation</h3>
                <p className="text-sm text-muted-foreground">Continuously advancing the state of AI in cybersecurity.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Responsibility</h3>
                <p className="text-sm text-muted-foreground">Promoting ethical use and providing tools for defense.</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Empowerment</h3>
                <p className="text-sm text-muted-foreground">Giving security professionals the tools they need to succeed.</p>
              </div>
            </div>
          </div>
        </div>
        <div>
           <Image
            src="https://placehold.co/600x400.png"
            alt="Team working on code"
            className="rounded-lg shadow-lg"
            width={600}
            height={400}
            data-ai-hint="team collaboration"
          />
        </div>
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
                        <Button variant="outline">View Profile</Button>
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
