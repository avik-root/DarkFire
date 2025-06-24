import { ShieldAlert, Users, Target } from "lucide-react";
import Image from "next/image";
import ProfileCard from "@/components/profile-card";
import "@/components/ProfileCard.css";

const teamMembers = [
  {
    name: "Alex 'Void' Thompson",
    role: "Lead AI Architect",
    avatar: "https://i.pravatar.cc/300?u=alex",
    handle: "alexvoid",
    bio: "The mastermind behind DarkFire's core AI. Alex has a decade of experience in machine learning and a passion for pushing the boundaries of generative models.",
  },
  {
    name: "Jasmine 'Proxy' Chen",
    role: "Head of Security Research",
    avatar: "https://i.pravatar.cc/300?u=jasmine",
    handle: "jasmineproxy",
    bio: "Jasmine ensures our generated payloads are effective and relevant. A world-renowned ethical hacker, she leads our threat intelligence team.",
  },
];

export default function AboutPage() {
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
             <ProfileCard
                key={member.name}
                name={member.name}
                title={member.role}
                handle={member.handle}
                avatarUrl={member.avatar}
                miniAvatarUrl={member.avatar}
                contactText="View Profile"
                showUserInfo={true}
              />
          ))}
        </div>
      </section>
    </div>
  );
}
