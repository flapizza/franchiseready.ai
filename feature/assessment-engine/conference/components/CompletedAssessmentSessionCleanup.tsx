"use client";

import { useEffect } from "react";

export function CompletedAssessmentSessionCleanup() {
  useEffect(() => { sessionStorage.removeItem("frangroove.conference-assessment.v1"); }, []);
  return null;
}
