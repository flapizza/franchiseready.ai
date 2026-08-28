-- Allow authorized candidate writes to return the row without re-reading the
-- candidate table from the SELECT policy during the same statement.

drop policy candidates_select_authorized on public.candidates;

create policy candidates_select_authorized
on public.candidates
for select
to authenticated
using (public.can_view_membership(assigned_membership_id));
