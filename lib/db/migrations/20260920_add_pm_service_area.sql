ALTER TABLE pm_headers
  ADD COLUMN IF NOT EXISTS show_service_area boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_area_machine_number text,
  ADD COLUMN IF NOT EXISTS service_area_location text;

UPDATE pm_headers SET
  show_service_area = true,
  service_area_machine_number = 'AC 3/6A',
  service_area_location = 'Counting line room'
WHERE machine_id = (SELECT id FROM machines WHERE machine_number = 'AC 3/6 A')
  AND service_area_machine_number IS NULL
  AND service_area_location IS NULL;
