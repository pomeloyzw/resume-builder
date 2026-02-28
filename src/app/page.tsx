"use client";

import React, { useRef, useState } from "react";
import BuilderForm from "@/components/BuilderForm";
import ResumePreview from "@/components/ResumePreview";
import ImportPdfModal from "@/components/ImportPdfModal";
import { Download, Upload } from "lucide-react";
import { useResume, useResumeStore } from "@/lib/ResumeContext";
import { useReactToPrint } from "react-to-print";

export default function Home() {
  const { template, setTemplate } = useResume();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Resume",
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200">
      {/* Left side: Form */}
      <aside className="w-full md:w-5/12 lg:w-1/3 h-[50vh] md:h-screen overflow-y-auto border-r border-gray-200 bg-white shadow-lg z-10 print:hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Resume Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in your details, select a template, and export.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <BuilderForm />
        </div>
      </aside>

      {/* Right side: Preview */}
      <main className="w-full md:w-7/12 lg:w-2/3 h-[50vh] md:h-screen flex flex-col print:w-full print:h-auto">
        {/* Topbar for actions */}
        <header className="h-16 border-b border-gray-200 bg-white/70 backdrop-blur-md px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Template:</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="text-sm bg-gray-100 border-none rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Import PDF Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            >
              <Upload size={16} />
              Import PDF
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                // Zustand automatically persists via localStorage, we just show a visual confirmation
                alert("Resume saved securely to this browser!");
              }}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Save
            </button>

            {/* Print PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </header>

        {/* Live Preview Area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 md:p-8 print:p-0 flex justify-center print:block print:bg-white print:overflow-visible relative">
          <ResumePreview contentRef={contentRef} />
        </div>
      </main>

      {/* Import PDF Modal */}
      {showImportModal && (
        <ImportPdfModal onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
