"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useResumeStore } from "@/lib/ResumeContext";
import { ResumeData } from "@/types/resume";

type ImportState = "idle" | "loading" | "success" | "error";
type ParseMethod = "local" | "ai";

type ParseSummary = {
  name: string;
  email: string;
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  certificationsCount: number;
};

export default function ImportPdfModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<ImportState>("idle");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const [parsedData, setParsedData] = useState<Partial<ResumeData> | null>(null);
  const [parseMethod, setParseMethod] = useState<ParseMethod>("local");
  const [aiLoading, setAiLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const setData = useResumeStore((s) => s.setData);

  const buildSummary = (parsed: Partial<ResumeData>): ParseSummary => ({
    name: parsed.personalInfo?.fullName ?? "",
    email: parsed.personalInfo?.email ?? "",
    experienceCount: parsed.experience?.length ?? 0,
    educationCount: parsed.education?.length ?? 0,
    skillsCount: parsed.skills?.length ?? 0,
    certificationsCount: parsed.certifications?.length ?? 0,
  });

  const processFile = useCallback(async (file: File) => {
    // Strict PDF validation
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setState("error");
      setError("Only PDF files are accepted. Please select a .pdf file.");
      return;
    }

    setFileName(file.name);
    setState("loading");
    setParseMethod("local");
    setError("");

    try {
      // Step 1: Extract text from PDF client-side
      const { extractTextFromPdf } = await import("@/lib/extractPdfText");
      const text = await extractTextFromPdf(file);

      if (!text.trim()) {
        throw new Error("Could not extract any text from this PDF. The file may be image-based or empty.");
      }

      // Save extracted text for potential AI re-parse later
      setExtractedText(text);

      // Step 2: Parse locally with heuristic parser (no API call)
      const { parsePdfText } = await import("@/lib/parsePdfText");
      const parsed = parsePdfText(text);

      // Debug: check extracted text structure
      console.log("── PDF Import Debug ──");
      console.log("Extracted text:\n", text);
      console.log("Parsed result:", JSON.stringify(parsed, null, 2));
      console.log("──────────────────────");

      setParsedData(parsed);
      setSummary(buildSummary(parsed));
      setState("success");
    } catch (err: any) {
      setState("error");
      setError(err.message || "An unexpected error occurred while parsing the PDF.");
    }
  }, []);

  const handleAiReparse = useCallback(async () => {
    if (!extractedText) return;

    setAiLoading(true);
    setError("");

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to parse resume with AI");
      }

      const { data: parsed } = await res.json();
      setParsedData(parsed);
      setSummary(buildSummary(parsed));
      setParseMethod("ai");
    } catch (err: any) {
      setError(err.message || "AI parsing failed. Your local parse result is still available.");
    } finally {
      setAiLoading(false);
    }
  }, [extractedText]);

  const handleImport = () => {
    if (!parsedData) return;

    setData((prev) => {
      const merged: ResumeData = {
        ...prev,
        personalInfo: {
          fullName: parsedData.personalInfo?.fullName || prev.personalInfo.fullName,
          jobTitle: parsedData.personalInfo?.jobTitle || prev.personalInfo.jobTitle,
          email: parsedData.personalInfo?.email || prev.personalInfo.email,
          phone: parsedData.personalInfo?.phone || prev.personalInfo.phone,
          location: parsedData.personalInfo?.location || prev.personalInfo.location,
          website: parsedData.personalInfo?.website || prev.personalInfo.website,
          github: parsedData.personalInfo?.github || prev.personalInfo.github,
          linkedin: parsedData.personalInfo?.linkedin || prev.personalInfo.linkedin,
        },
        summary: parsedData.summary || prev.summary,
        experience: parsedData.experience?.length ? parsedData.experience : prev.experience,
        education: parsedData.education?.length ? parsedData.education : prev.education,
        skills: parsedData.skills?.length ? parsedData.skills : prev.skills,
        languages: parsedData.languages?.length ? parsedData.languages : prev.languages,
        certifications: parsedData.certifications?.length ? parsedData.certifications : prev.certifications,
        hobbies: parsedData.hobbies?.length ? parsedData.hobbies : prev.hobbies,
        customSections: prev.customSections,
        sectionOrder: parsedData.sectionOrder ?? prev.sectionOrder,
      };
      return merged;
    });

    onClose();
  };

  // ─── Drag & Drop ────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in"
        style={{ animation: "modalIn 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Upload size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Import PDF Resume</h2>
              <p className="text-xs text-gray-500">Upload your existing resume to populate the builder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {state === "idle" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center gap-4 py-12 px-6
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200 ease-out
                ${isDragging
                  ? "border-blue-500 bg-blue-50/70 scale-[1.01] shadow-lg shadow-blue-500/10"
                  : "border-gray-300 bg-gray-50/50 hover:border-blue-400 hover:bg-blue-50/30"
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
                  ${isDragging
                    ? "bg-blue-500 shadow-lg shadow-blue-500/30 scale-110"
                    : "bg-gradient-to-br from-gray-100 to-gray-200"
                  }
                `}
              >
                <FileText
                  size={28}
                  className={`transition-colors duration-200 ${isDragging ? "text-white" : "text-gray-500"}`}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? "Drop your PDF here" : "Drag & drop your PDF resume here"}
                </p>
                <p className="text-xs text-gray-400 mt-1">or click to browse files · PDF only</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {state === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-14">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Loader2 size={28} className="text-white animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Parsing your resume…</p>
                <p className="text-xs text-gray-500 mt-1">{fileName}</p>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Import Failed</p>
                <p className="text-xs text-red-500 mt-1 max-w-xs">{error}</p>
              </div>
              <button
                onClick={() => {
                  setState("idle");
                  setError("");
                  setFileName("");
                }}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {state === "success" && summary && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={22} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Resume parsed successfully!</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-500">{fileName}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${parseMethod === "ai"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                      }`}>
                      {parseMethod === "ai" ? (
                        <><Sparkles size={10} /> AI Parsed</>
                      ) : (
                        "Local Parse"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-3">
                {summary.name && (
                  <SummaryCard label="Name" value={summary.name} />
                )}
                {summary.email && (
                  <SummaryCard label="Email" value={summary.email} />
                )}
                <SummaryCard label="Experience" value={`${summary.experienceCount} entries`} />
                <SummaryCard label="Education" value={`${summary.educationCount} entries`} />
                <SummaryCard label="Skills" value={`${summary.skillsCount} found`} />
                <SummaryCard label="Certifications" value={`${summary.certificationsCount} found`} />
              </div>

              {/* AI Re-parse option */}
              {parseMethod === "local" && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Results not accurate?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Re-parse with AI for better accuracy</p>
                  </div>
                  <button
                    onClick={handleAiReparse}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <><Loader2 size={12} className="animate-spin" /> Parsing…</>
                    ) : (
                      <><Sparkles size={12} /> Use AI</>
                    )}
                  </button>
                </div>
              )}

              {/* AI error (non-fatal) */}
              {error && parseMethod === "local" && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}

              <p className="text-xs text-gray-400 text-center">
                This will replace your current resume data with the imported content.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {state === "success" && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200/60 bg-gray-50/50">
            <button
              onClick={() => {
                setState("idle");
                setParsedData(null);
                setSummary(null);
                setFileName("");
                setExtractedText("");
                setParseMethod("local");
                setError("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={aiLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Resume
            </button>
          </div>
        )}
      </div>

      {/* Inline animation keyframes */}
      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate mt-0.5">{value}</p>
    </div>
  );
}
