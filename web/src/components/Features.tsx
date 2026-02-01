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
    title: "Smart Personality",
    description:
      "Beyond simple chat. Build experts that think, plan, and execute across your digital life with Gemini 3 Pro.",
  },
  {
    icon: Zap,
    title: "Brain Sync",
    description:
      "Feed your agent any document, video, or website. GAIA learns and indexes your knowledge in seconds.",
  },
  {
    icon: Globe,
    title: "Connect to Apps",
    description:
      "Deploy your agent to WhatsApp, Telegram, or Slack. Talk to your personal assistant wherever you are.",
  },
  {
    icon: Cpu,
    title: "Smart Search",
    description:
      "Leverage advanced search that finds exactly what you need from your own private knowledge base.",
  },
  {
    icon: MessageSquare,
    title: "Live Studio",
    description:
      "Fine-tune your agent's personality in real-time with an intuitive, interactive chat interface.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is strictly yours. Isolated, encrypted, and private by design. No compromises on security.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 border-t border-zinc-800">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything you need to build your AI workforce
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            GAIA is built to be powerful yet simple. Create agents that understand your world.
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
