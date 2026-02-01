import { useState } from "react";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { DeveloperCLI } from "../components/DeveloperCLI";
import { Security } from "../components/Security";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { AuthModal } from "../components/auth/AuthModal";

interface LandingPageProps {
    onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleAuthSuccess = () => {
        setIsAuthModalOpen(false);
        onGetStarted(); // Redirect to dashboard after login
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Hero
                onAuth={() => setIsAuthModalOpen(true)}
            />
            <Features />
            <HowItWorks />
            <DeveloperCLI />
            <Security />
            <Footer />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}
