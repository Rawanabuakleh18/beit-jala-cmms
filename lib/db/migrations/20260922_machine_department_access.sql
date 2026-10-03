-- Preserve existing accounts; new accounts are explicitly scoped by the API.
ALTER TABLE users ADD COLUMN IF NOT EXISTS machine_department_ids jsonb;
