BEGIN;

INSERT INTO permissions (name, description)
VALUES
  ('edit_header_equipment_information', 'edit equipment information header'),
  ('edit_header_preventive_maintenance', 'edit preventive maintenance header'),
  ('edit_header_corrective_maintenance', 'edit corrective maintenance header'),
  ('edit_header_closed_corrective_log', 'edit closed corrective maintenance log header'),
  ('edit_header_annual_plan', 'edit annual maintenance plan header'),
  ('edit_header_monthly_plan', 'edit monthly maintenance plan header')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Preserve existing access by granting every replacement permission to users
-- who had the former all-or-nothing edit_header permission.
INSERT INTO user_permissions (user_id, permission_id)
SELECT legacy_users.user_id, replacement.id
FROM (
  SELECT DISTINCT up.user_id
  FROM user_permissions up
  JOIN permissions legacy ON legacy.id = up.permission_id
  WHERE legacy.name = 'edit_header'
) legacy_users
CROSS JOIN permissions replacement
WHERE replacement.name IN (
  'edit_header_equipment_information',
  'edit_header_preventive_maintenance',
  'edit_header_corrective_maintenance',
  'edit_header_closed_corrective_log',
  'edit_header_annual_plan',
  'edit_header_monthly_plan'
)
AND NOT EXISTS (
  SELECT 1
  FROM user_permissions existing
  WHERE existing.user_id = legacy_users.user_id
    AND existing.permission_id = replacement.id
);

DELETE FROM user_permissions
WHERE permission_id IN (SELECT id FROM permissions WHERE name = 'edit_header');

DELETE FROM permissions WHERE name = 'edit_header';

COMMIT;
