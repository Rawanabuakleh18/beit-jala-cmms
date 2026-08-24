BEGIN;

INSERT INTO permissions (name, description)
VALUES ('edit_header_maintenance_request', 'edit maintenance request header')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Users migrated from the former general header permission already hold all
-- six split permissions. Preserve that same access for this omitted header.
INSERT INTO user_permissions (user_id, permission_id)
SELECT DISTINCT up.user_id, target.id
FROM user_permissions up
JOIN permissions current_permission ON current_permission.id = up.permission_id
CROSS JOIN permissions target
WHERE current_permission.name LIKE 'edit_header_%'
  AND target.name = 'edit_header_maintenance_request'
  AND NOT EXISTS (
    SELECT 1 FROM user_permissions existing
    WHERE existing.user_id = up.user_id
      AND existing.permission_id = target.id
  );

COMMIT;
