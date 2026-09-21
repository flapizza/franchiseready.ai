import test from 'node:test';
import assert from 'node:assert/strict';
import '../fixtures/register-typescript.mjs';
const { demoAssessmentPresentation } = await import('../../feature/assessment-reports/services/demoAssessmentPresentation.ts');
const { historicalReport } = await import('../../feature/assessment-reports/services/HistoricalAssessmentDocuments.ts');
const { renderAssessmentReportPdf } = await import('../../feature/assessment-reports/services/PdfRenderer.ts');
const { buildReferralPacket } = await import('../../feature/referral-package/services/ReferralPacket.ts');
const { ConferenceAssessmentAnalysisService } = await import('../../feature/assessment-engine/conference/ConferenceAssessmentAnalysisService.ts');
import { conferenceAssessmentPersonas, personaIntake } from '../fixtures/conference-assessment-personas.mjs';

const org = 'e117c597-0966-43ee-a128-a43dd979504e';
const candidate = 'cand_14e86a7e44ac48ab9da158beaf2081f8';
function record() {
  return {
    id: 'eeecb850-2df0-45a4-8bb4-9c4afbdc866a',
    sessionId: '8cfdc99f-abcf-4a82-8a25-4e860c46e7fb',
    submissionId: '79650038-1907-4e1c-a642-018c7d27c62b',
    instrumentVersion: 'franchise-ownership-assessment-v1',
    completedAt: '2026-09-16T18:47:56.313156+00:00', generatedAt: '2026-09-16T18:47:56.313156+00:00',
    intake: { ...personaIntake, firstName: 'Synthetic', lastName: 'IFPG Hero',
      email: 'ifpg-hero-1789584463711@certification.example', occupationTitle: 'Synthetic certification participant',
      streetAddress: '1 Synthetic Test Way', city: 'Orlando', stateProvince: 'FL', postalCode: '32801' },
    answers: structuredClone(conferenceAssessmentPersonas[0].answers),
    analysis: new ConferenceAssessmentAnalysisService().analyze(personaIntake, conferenceAssessmentPersonas[0].answers),
  };
}
test('exact demo identity is presented without mutating evidence, analysis, geography or provenance', () => {
  const original = record(), before = structuredClone(original);
  Object.freeze(original.intake); Object.freeze(original);
  const shown = demoAssessmentPresentation(org, candidate, original);
  assert.deepEqual(original, before);
  assert.equal(shown.analysis, original.analysis); assert.equal(shown.answers, original.answers);
  assert.deepEqual({ ...shown, intake: original.intake }, original);
  assert.equal(shown.intake.firstName, 'Benjamin'); assert.equal(shown.intake.lastName, 'Carter');
  assert.equal(shown.intake.email, 'benjamin.carter@frangroove-demo.example');
  assert.equal(shown.intake.occupationTitle, 'Operations Manager');
  assert.equal(shown.intake.streetAddress, '184 Lakeview Terrace');
  for (const key of ['city', 'stateProvince', 'postalCode', 'mobilePhone']) assert.equal(shown.intake[key], original.intake[key]);
});
test('other organizations, candidates, sessions and submissions retain normal historical behavior', () => {
  const original = record();
  assert.equal(demoAssessmentPresentation('other-org', candidate, original), original);
  assert.equal(demoAssessmentPresentation(org, 'other-candidate', original), original);
  for (const key of ['sessionId', 'submissionId']) {
    const other = { ...original, [key]: 'other-record' };
    assert.equal(demoAssessmentPresentation(org, candidate, other), other);
  }
});
test('all historical report models and PDFs use Benjamin while retaining original response evidence', () => {
  const original = record(), shown = demoAssessmentPresentation(org, candidate, original);
  for (const kind of ['assessment', 'profile', 'consultant']) {
    const report = historicalReport(shown, kind);
    assert.equal(report.candidateName, 'Benjamin Carter');
    assert.doesNotMatch(JSON.stringify(report), /Synthetic|IFPG|certification/i);
    const pdf = Buffer.from(renderAssessmentReportPdf(report)).toString();
    assert.match(pdf, /Benjamin Carter/); assert.doesNotMatch(pdf, /Synthetic|IFPG|certification/i);
    assert.match(pdf, new RegExp(original.submissionId));
  }
  assert.ok(historicalReport(shown, 'assessment').sections.some(s => JSON.stringify(s.paragraphs) === JSON.stringify(original.answers.q1)));
});
test('referral model and PDF present the corrected identity and background without changing intelligence', () => {
  const shown = demoAssessmentPresentation(org, candidate, record());
  const context = {
    record: shown,
    row: { candidate: { firstName: 'Benjamin', lastName: 'Carter', email: shown.intake.email, phone: '' }, assessment: { analysis: shown.analysis }, discovery: null },
    brand: { name: 'Brand', versionId: 'existing-version', band: 'Worth exploring', evidenceLabel: 'Unverified', concept: false, strengths: [], factors: [] },
    consideration: { state: 'selected', consultant_note: 'Review before introduction.' },
    readiness: { band: 'Not ready', items: [] }, consultant: { name: 'Alex Morgan', email: 'alex.morgan@frangroove-demo.example' },
  };
  const report = buildReferralPacket(context, new Date('2026-09-21T12:00:00Z'));
  assert.match(JSON.stringify(report.sections), /Benjamin Carter/);
  assert.match(JSON.stringify(report.sections), /Operations Manager/);
  assert.doesNotMatch(JSON.stringify(report), /Synthetic|IFPG|certification/i);
  assert.equal(report.source, shown.analysis);
  const pdf = Buffer.from(renderAssessmentReportPdf(report)).toString();
  assert.match(pdf, /Operations Manager/); assert.doesNotMatch(pdf, /Synthetic|IFPG|certification/i);
});
