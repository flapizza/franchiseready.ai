# Conference assessment mode

The IFPG conference assessment at `/assessment/start` is available only when conference demo access is explicitly enabled. It uses the existing assessment-engine boundary and a dedicated process-local store. An attendee is not added to canonical seeded candidates; a temporary record is created only after the complete response set passes server-side validation and deterministic analysis.

Browser refresh recovery uses session storage. Candidate identity never appears in the URL; completed records use opaque assessment and candidate identifiers. Restarting the Node process discards all conference assessments. An authenticated consultant can also use **Clear Conference Assessments**, and the guarded `/crm/test-reset` clears conference records alongside the existing mutable demo overlay. Neither action modifies Jared, Sarah, or other immutable fixtures.

The consultant view exposes an Opportunity Characteristics Profile as the Brand Strategy bridge. It deliberately does not rank brands. Assessment-created priorities are shaped as Discovery questions and validation areas, reusing the existing Discovery vocabulary without creating a parallel persistent Discovery workflow. Communications, meetings, referrals, presentations, Gmail history, and other downstream activity remain explicitly not started.

This store is a conference demonstration boundary, not production persistence. A future production implementation should replace it behind a repository contract with an opaque resumable invitation/session token, lifecycle persistence, retention policy, and authorization appropriate to durable candidate data.
