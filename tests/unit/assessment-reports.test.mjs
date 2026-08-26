import assert from "node:assert/strict";
import test from "node:test";
import { ConferenceAssessmentAnalysisService } from "../../feature/assessment-engine/conference/ConferenceAssessmentAnalysisService.ts";
import { conferenceAssessmentPersonas, personaIntake } from "../fixtures/conference-assessment-personas.mjs";
import { AssessmentReportService } from "../../feature/assessment-reports/services/AssessmentReportService.ts";
import { renderAssessmentReportPdf, safeReportFilename } from "../../feature/assessment-reports/services/PdfRenderer.ts";

const analysis=new ConferenceAssessmentAnalysisService().analyze(personaIntake,conferenceAssessmentPersonas[0].answers);
const source={analysis,completedAt:"2026-08-26T12:00:00.000Z",generatedAt:"2026-08-26T13:00:00.000Z",candidateName:"Michelle Wood",instrumentVersion:"franchise-ownership-assessment-v1"};
const text=buffer=>new TextDecoder().decode(buffer);
const pages=buffer=>(text(buffer).match(/\/Type \/Page\b/g)??[]).length;

test("candidate PDF is real, versioned, candidate-safe, and professionally named",()=>{
  const report=new AssessmentReportService().buildCandidateReport(source);const pdf=renderAssessmentReportPdf(report);const output=text(pdf);
  assert.match(output,/^%PDF-1\.4/);assert.ok(pdf.byteLength>2_000);assert.equal(pages(pdf),2);assert.match(output,/Franchise Ownership Profile/);assert.match(output,/Franchise Ownership Assessment v1\.0/);assert.match(output,/BUSINESS CHARACTERISTICS WORTH EXPLORING/);assert.match(output,/Relationship Led/);assert.match(output,/Owner Selling/);assert.doesNotMatch(output,/relationship-led/);assert.match(output,/not independently verified by FranGroove/);assert.doesNotMatch(output,/INTERNAL CONSULTANT USE|Potential Tensions|Supporting Evidence|Consultant Brief|q\d+|opaque-test-token/);assert.equal(safeReportFilename(source.candidateName,report.reportType),"Michelle-Wood-FranGroove-Ownership-Profile.pdf");
});

test("consultant PDF contains internal designation and deeper Discovery intelligence",()=>{
  const report=new AssessmentReportService().buildConsultantReport(source);const output=text(renderAssessmentReportPdf(report));
  assert.equal(pages(renderAssessmentReportPdf(report)),3);assert.match(output,/INTERNAL CONSULTANT USE/);assert.match(output,/CONSULTANT BRIEF/);assert.match(output,/DISCOVERY PRIORITIES/);assert.match(output,/OPPORTUNITY CHARACTERISTICS/);assert.match(output,/SUPPORTING EVIDENCE/);assert.ok(output.includes("SUPPORTING EVIDENCE \\(CONTINUED\\)"));assert.doesNotMatch(output,/q\d+|opaque-test-token/);assert.equal(safeReportFilename("A/B <Candidate>",report.reportType),"A-B-Candidate-FranGroove-Consultant-Intelligence.pdf");
});
