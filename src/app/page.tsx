import PayloadGenerator from "@/components/payload-generator";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10">
        <h1 className="text-6xl md:text-8xl font-headline tracking-tighter text-primary">
          Welcome to DarkFire
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Your AI-powered assistant for generating custom security scripts and payloads.
          Select your desired language, payload type, and provide specifications to create tailored code for your security assessments.
        </p>
      </section>

      <PayloadGenerator />
    </div>
  );
}
