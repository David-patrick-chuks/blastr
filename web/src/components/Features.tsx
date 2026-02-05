import {
  Shield,
  Bot,
  Zap,
  Cpu,
  Globe,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Personalization",
    description:
      "Beyond generic templates. BLASTR crafts unique, personalized emails for every recipient using Gemini 2.0 Flash.",
  },
  {
    icon: Zap,
    title: "Instant Extraction",
    description:
      "Upload screenshots of handles or lists. Our Vision engine extracts and prepares email addresses in seconds.",
  },
  {
    icon: Globe,
    title: "SMTP Deliverability",
    description:
      "Connect your own SMTP or Gmail credentials. High-speed, high-deliverability email blasting without middlemen.",
  },
  {
    icon: Cpu,
    title: "Smart De-duping",
    description:
      "Clean your lists automatically. Advanced AI detection removes duplicates and invalid formatting before every transmission.",
  },
  {
    icon: MessageSquare,
    title: "Template Studio",
    description:
      "Iterate on your campaign messaging in real-time with an interactive preview and AI composition assistant.",
  },
  {
    icon: Shield,
    title: "Secure Operations",
    description:
      "Your recipient lists and credentials stay private. Encrypted storage and isolated campaign execution by design.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 border-t border-zinc-800">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            High-Performance Email Orchestration
          </h2>
          <p className="mt-4 text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
            BLASTR is engineered for speed and precision. Scale your outreach with intelligent automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="relative p-6 bg-zinc-950 hover:bg-zinc-900/80 transition-colors group"
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-transparent group-hover:border-blue-500/50 transition-colors" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-transparent group-hover:border-blue-500/50 transition-colors" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 border border-zinc-700 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs text-zinc-600 font-mono">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
