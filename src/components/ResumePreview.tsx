"use client";

import React from "react";
import { useResume } from "@/lib/ResumeContext";
import ClassicTemplate from "./Templates/ClassicTemplate";
import ModernTemplate from "./Templates/ModernTemplate";

export default function ResumePreview({ contentRef }: { contentRef?: React.RefObject<HTMLDivElement | null> }) {
  const { data, template } = useResume();

  return (
    <div className="w-full flex justify-center relative">
      <div className="shadow-2xl print:shadow-none bg-white relative">
        {template === "classic" ? (
          <ClassicTemplate data={data} ref={contentRef} />
        ) : (
          <ModernTemplate data={data} ref={contentRef} />
        )}
      </div>
    </div>
  );
}
