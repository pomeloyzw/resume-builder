"use client";

import React, { useRef, useState } from "react";
import BuilderForm from "@/components/BuilderForm";
import ResumePreview from "@/components/ResumePreview";
import ImportPdfModal from "@/components/ImportPdfModal";
import { Download, Upload, CheckCircle } from "lucide-react";
import { useResume, useResumeStore } from "@/lib/ResumeContext";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { template, setTemplate } = useResume();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
            Premium Resume Builder
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
            <Select value={template} onValueChange={(val: any) => setTemplate(val)}>
              <SelectTrigger className="w-[120px] bg-gray-100 border-none cursor-pointer h-8">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            {/* Import PDF Button */}
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              className="px-4 shadow-sm hover:shadow-md h-9"
            >
              <Upload size={16} className="mr-2" />
              Import PDF
            </Button>

            {/* Save Button */}
            <Button
              variant="outline"
              onClick={() => {
                // Zustand automatically persists via localStorage, we just show a visual confirmation
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
              }}
              className="px-4 shadow-sm hover:shadow-md h-9"
            >
              Save
            </Button>

            {/* Print PDF Button */}
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md h-9"
            >
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
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

      {/* Save Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <CheckCircle size={20} className="text-green-400" />
          <span className="font-medium">Resume saved securely!</span>
        </div>
      )}
    </div>
  );
}
