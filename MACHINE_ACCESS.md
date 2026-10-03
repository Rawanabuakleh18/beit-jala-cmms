# Machine department access

In **Users → Edit user → أقسام الماكينات المسموحة**, choose one or more
departments and save. These are the machines' current departments, independent
of the employee's profile department or the department submitting a request.
Action permissions (view, edit, approve, etc.) still apply in addition to scope.

- `machine_department_ids = null`: all departments, including unassigned machines.
- An empty array: no machine access. New non-admin accounts start this way;
  after creation the UI opens the user's permission settings.
- An array of IDs: only machines assigned to those departments.
- Admin accounts always have full access. Existing accounts retain their previous
  unrestricted access until explicitly configured.

The server reloads scope for every authenticated API request. Lists and metrics
are filtered before serialization/aggregation. Direct URLs, submitted machine
IDs, plan row batches, associated signatures, and nested records are checked.
Automatic annual/monthly plan synchronization remains global; visible rows and
user edits are scoped independently so a restricted view cannot erase other rows.

Manual closed-log entries and manually entered company-wide report adjustments
have no authoritative machine link, so restricted users cannot access or alter
them. Their reports show scoped computed metrics. Signing/altering shared plan
headers requires unrestricted access because those approvals cover the full plan.
General spare-parts inventory remains shared; linked movement history and references
are checked against machine access. Restricted audit views contain allowed machine
events only.

## Deployment and verification

Apply the additive migration before running the updated API:

```powershell
node --env-file=.env scripts/apply-machine-access-migration.cjs
pnpm.cmd run typecheck
pnpm.cmd --filter @workspace/api-server build
pnpm.cmd --filter @workspace/cmms build
```

Restart the API after building. The settings API is `GET/PUT
/api/users/:id/machine-access`, protected by `manage_users`; PUT accepts
`{ "departmentIds": null }` or an array of existing department IDs.

The integration test clones table structure into a random isolated PostgreSQL
schema with independent sequences, starts an ephemeral HTTP server, tests scoped
and unrestricted sessions, and removes the test schema in `finally`:

```powershell
node --env-file=.env --import ./scripts/node_modules/tsx/dist/loader.mjs scripts/test-machine-department-access.mts
```
