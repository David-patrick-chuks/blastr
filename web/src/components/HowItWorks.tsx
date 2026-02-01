const steps = [
  {
    number: "01",
    title: "Define your Campaign",
    description:
      "Set your campaign goals, subject lines, and drafting templates. BlastAgent AI uses these to craft perfectly tuned, personalized messages.",
    code: `/* Initializing Campaign */
campaign.id = "q1_reachout";
campaign.subject = "Exclusive Update";
campaign.template = "Hi {{name}}...";`,
  },
  {
    number: "02",
    title: "Extract Recipients",
    description:
      "Upload image lists or screenshots. Our AI Vision engine identifies email addresses, verifies formats, and appends them to your targeted campaigns.",
    code: `// Extracting from Base64 List
const list = await vision.extract(image);
const recipients = list.filter(e => e.valid);
campaign.sync(recipients);`,
  },
  {
    number: "03",
    title: "Blast High-Volume",
    description:
      "Connect your SMTP and launch. Track delivered messages, open rates, and response metrics in real-time through the BlastAgent dashboard.",
    code: `// Initializing SMTP Transmission
connecting_host: "smtp.gmail.com"
status: "BLASTING" [3,248 SENT]
delivery_rate: 99.8%`,
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 border-t border-zinc-800 bg-zinc-900/50">
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-zinc-800 via-zinc-800 to-transparent hidden lg:block" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            The Ultimate Email Pipeline
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            The simplest way to orchestrate high-volume, Gemini-powered outreach.
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col lg:flex-row gap-8 items-start ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
            >
              {/* Text content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl font-bold text-zinc-800 font-mono">
                    {step.number}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-700 to-transparent" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="flex-1 w-full relative">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-l border-t border-blue-500/40" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-r border-t border-blue-500/40" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l border-b border-blue-500/40" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r border-b border-blue-500/40" />

                <div className="border border-zinc-800 bg-zinc-950">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                    <span className="text-xs text-zinc-600 font-mono">
                      BLASTAGENT_AI
                    </span>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-zinc-700" />
                      <div className="w-2 h-2 bg-zinc-700" />
                      <div className="w-2 h-2 bg-zinc-700" />
                    </div>
                  </div>
                  <pre className="p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
