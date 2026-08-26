"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CompletedAssessmentSessionCleanup() {
  const pathname=usePathname();
  useEffect(() => { sessionStorage.removeItem("frangroove.conference-assessment.v1"); }, []);
  return <a href={`${pathname}/report`} className="mb-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white sm:w-auto">Download My Report (PDF)</a>;
}
