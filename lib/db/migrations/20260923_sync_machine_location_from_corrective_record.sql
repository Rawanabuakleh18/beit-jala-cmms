CREATE OR REPLACE FUNCTION sync_machine_location_from_active_corrective_record()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' AND (
    TG_OP = 'INSERT'
    OR COALESCE(BTRIM(NEW.machine_location), '') IS DISTINCT FROM COALESCE(BTRIM(OLD.machine_location), '')
  ) THEN
    UPDATE machines
    SET location = NULLIF(BTRIM(NEW.machine_location), ''),
        updated_at = NOW()
    WHERE id = NEW.machine_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS corrective_record_syncs_machine_location ON corrective_maintenance_records;

CREATE TRIGGER corrective_record_syncs_machine_location
AFTER INSERT OR UPDATE OF machine_location ON corrective_maintenance_records
FOR EACH ROW
EXECUTE FUNCTION sync_machine_location_from_active_corrective_record();
