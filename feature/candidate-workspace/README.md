# Canonical workspace ownership

This package owns candidate-workspace orchestration, workspace state, and the
command-center composition boundary. The established components in
`feature/crm/components` remain supported presentation components and can be
migrated incrementally. New workspace runtimes belong here; CRM continues to
own candidate records, repositories, workflow, and health models.
