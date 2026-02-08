import { useState, useRef } from "react";
import { Shield, Globe, Search, CheckCircle2, Trash2, Upload, Loader2, FileText, Copy, Download, ClipboardList } from "lucide-react";
import { InfoModal } from "../../components/Modal";
import { campaignService } from "../../services/index";

export function DeployView() {
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoMessage, setInfoMessage] = useState<React.ReactNode>("");

    const [processing, setProcessing] = useState(false);
    const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
    const [inputMode, setInputMode] = useState<"file" | "paste">("file");
    const [rawText, setRawText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showInfo = (title: string, message: React.ReactNode) => {
        setInfoTitle(title);
        setInfoMessage(message);
        setInfoModalOpen(true);
    };

    const extractEmailsFromString = (text: string) => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = text.match(emailRegex) || [];
        // De-duplicate
        return [...new Set(matches.map(e => e.toLowerCase()))];
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isText = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt');

        event.target.value = '';
        setProcessing(true);

        try {
            if (isImage) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    try {
                        const base64 = (reader.result as string).split(',')[1];
                        const res = await campaignService.extractEmails(base64);
                        setExtractedEmails(res.emails);
                        showInfo("Vision Extraction Complete", `Found ${res.emails.length} email addresses in the image.`);
                    } catch (error) {
                        console.error("Extraction failed:", error);
                        showInfo("Extraction Failed", "Failed to extract emails using Gemini Vision.");
                    } finally {
                        setProcessing(false);
                    }
                };
            } else if (isText) {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    const emails = extractEmailsFromString(reader.result as string);
                    setExtractedEmails(emails);
                    showInfo("File Parsing Complete", `Extracted ${emails.length} email addresses from document.`);
                    setProcessing(false);
                };
            } else {
                showInfo("Unsupported Format", "Please upload an image (PNG/JPG) or a text file (TXT/CSV).");
                setProcessing(false);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            setProcessing(false);
        }
    };

    const handlePasteExtraction = () => {
        if (!rawText.trim()) return;
        const emails = extractEmailsFromString(rawText);
        setExtractedEmails(emails);
        showInfo("Extraction Complete", `Found ${emails.length} unique email addresses in your text.`);
    };

    const copyToClipboard = () => {
        if (extractedEmails.length === 0) return;
        const text = extractedEmails.join('\n');
        navigator.clipboard.writeText(text).then(() => {
            showInfo("Copied", "All extracted emails have been copied to your clipboard.");
        });
    };

    const downloadAsFile = (type: 'csv' | 'txt') => {
        if (extractedEmails.length === 0) return;
        const content = type === 'csv' ? "email\n" + extractedEmails.join('\n') : extractedEmails.join('\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extracted_emails_${new Date().getTime()}.${type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Email List Management</h2>
                        <p className="text-zinc-500 text-sm">Paste lists or upload files (Images, CSV, TXT) to extract and prepare your email databases.</p>
                    </div>
                    <div className="flex bg-zinc-900/50 border border-zinc-800 p-1">
                        <button
                            onClick={() => setInputMode('file')}
                            className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${inputMode === 'file' ? 'bg-blue-500 text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            File Upload
                        </button>
                        <button
                            onClick={() => setInputMode('paste')}
                            className={`px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${inputMode === 'paste' ? 'bg-blue-500 text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Paste List
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="space-y-4">
                        {inputMode === 'file' ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-dashed border-zinc-800 bg-zinc-900/40 h-[350px] flex flex-col items-center justify-center text-center space-y-6 group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,.csv,.txt"
                                />
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    {processing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                                </div>
                                <div className="space-y-2 px-10">
                                    <h3 className="text-lg font-bold">{processing ? 'Processing...' : 'Drop list or click to upload'}</h3>
                                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest leading-relaxed">
                                        Supports Images (OCR), CSV & TXT files
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="Paste your raw text or email list here... Gemini will find the needles in the haystack."
                                    className="w-full h-[280px] bg-zinc-900/40 border border-zinc-800 focus:border-blue-500/50 outline-none p-4 text-sm font-mono transition-all resize-none"
                                />
                                <button
                                    onClick={handlePasteExtraction}
                                    className="w-full py-3 bg-blue-500 text-zinc-900 font-bold text-xs uppercase tracking-widest hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <ClipboardList className="w-4 h-4" /> Extract from Text
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Extracted List */}
                    <div className="border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Extracted Recipients
                            </h3>
                            <div className={`px-2 py-0.5 border font-mono text-[10px] ${extractedEmails.length > 500 ? 'border-red-500/50 text-red-500 animate-pulse' : 'border-blue-500/20 text-blue-500'}`}>
                                COUNT: {extractedEmails.length.toLocaleString()} {extractedEmails.length > 500 ? '(LIMIT EXCEEDED)' : ''}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 border-y border-zinc-800/50 py-4">
                            {extractedEmails.length > 0 ? (
                                extractedEmails.map((email, i) => (
                                    <div key={i} className="p-3 bg-zinc-950 border border-zinc-800 flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                                                {i + 1}
                                            </div>
                                            <span className="text-xs font-mono text-zinc-300">{email}</span>
                                        </div>
                                        <button
                                            onClick={() => setExtractedEmails(prev => prev.filter((_, idx) => idx !== i))}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-zinc-600 font-mono text-xs italic">
                                    {processing ? 'Scanning for email patterns...' : 'Result list will appear here...'}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 grid grid-cols-3 gap-3">
                            <button
                                onClick={copyToClipboard}
                                disabled={extractedEmails.length === 0}
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all disabled:opacity-30 disabled:grayscale group"
                            >
                                <Copy className="w-4 h-4 text-zinc-500 group-hover:text-blue-400" />
                                <span className="text-[10px] font-mono uppercase">Copy All</span>
                            </button>
                            <button
                                onClick={() => downloadAsFile('csv')}
                                disabled={extractedEmails.length === 0}
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all disabled:opacity-30 disabled:grayscale group"
                            >
                                <FileText className="w-4 h-4 text-zinc-500 group-hover:text-blue-400" />
                                <span className="text-[10px] font-mono uppercase">CSV</span>
                            </button>
                            <button
                                onClick={() => downloadAsFile('txt')}
                                disabled={extractedEmails.length === 0}
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all disabled:opacity-30 disabled:grayscale group"
                            >
                                <Download className="w-4 h-4 text-zinc-500 group-hover:text-blue-400" />
                                <span className="text-[10px] font-mono uppercase">TXT</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={Shield}
                        title="Automatic De-duplication"
                        desc="Extractor automatically detects and removes duplicate entries as they are extracted."
                    />
                    <FeatureCard
                        icon={Globe}
                        title="Pattern Intelligence"
                        desc="Advanced regex patterns detect emails even when mixed with inconsistent text or junk data."
                    />
                    <FeatureCard
                        icon={CheckCircle2}
                        title="Clean Export"
                        desc="Export your cleaned lists instantly for use in any campaign management tool."
                    />
                </div>
            </div>

            <InfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title={infoTitle}
                message={infoMessage}
            />
        </>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
            <div className="w-10 h-10 border border-zinc-800 bg-zinc-900 flex items-center justify-center text-blue-400 mb-4">
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold mb-2">{title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-mono">{desc}</p>
        </div>
    );
}
