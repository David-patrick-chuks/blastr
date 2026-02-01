import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative ${sizeClasses[size]} w-full bg-zinc-900 border border-zinc-800 shadow-2xl`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "info"
}: ConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const variantStyles = {
        danger: "bg-red-500 hover:bg-red-400",
        warning: "bg-amber-500 hover:bg-amber-400",
        info: "bg-blue-500 hover:bg-blue-400",
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-6">
                <p className="text-zinc-300 leading-relaxed">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer font-mono text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 ${variantStyles[variant]} text-zinc-900 font-bold transition-all cursor-pointer font-mono text-sm`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, message }: InfoModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-6">
                <div className="text-zinc-300 leading-relaxed">{message}</div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold transition-all cursor-pointer font-mono text-sm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </Modal>
    );
}
// ... existing exports

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    placeholder?: string;
    actionLabel?: string;
    onAction: (value: string) => void;
}

export function InputModal({ isOpen, onClose, title, placeholder, actionLabel = "Submit", onAction }: InputModalProps) {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        onAction(value);
        setValue("");
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-6">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 outline-none focus:border-blue-500/50 text-sm font-mono text-white transition-all"
                />
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer font-mono text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!value}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-zinc-900 font-bold transition-all cursor-pointer font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
