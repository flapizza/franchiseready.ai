# Compatibility boundary

This package is the experimental predecessor to `feature/assessment-engine`.
The assessment engine is the canonical implementation for routed assessment
flows, runtime state, repositories, and scoring. Keep this package buildable
while existing concepts are migrated through explicit adapters; do not add new
routed assessment behavior here.
