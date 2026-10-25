# Supabase

`migrations/0001_init.sql` creates the schema, RLS policies and column-level grants from `docs/blueprint/03-data-model.md` and `09-pdf-viewer-spec.md`.

- Apply to a **dedicated PageWise project** (dev first). Do not apply to projects used by other apps.
- RLS tests (pgTAP) are added in milestone M4; until then do not point real users at the database.
- Roles: `student` (default), `reviewer`, `admin`. `role` and `consent_status` are not client-writable (column grants). Promote the first admin with SQL from the dashboard.
