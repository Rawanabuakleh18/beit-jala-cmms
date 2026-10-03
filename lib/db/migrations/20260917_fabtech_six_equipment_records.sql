-- Machine 58 was verified as PDM-01-097. Keep other machines' limits unchanged.
ALTER TABLE additional_equipment_records
  DROP CONSTRAINT additional_equipment_records_record_number_check;
ALTER TABLE additional_equipment_records
  ADD CONSTRAINT additional_equipment_records_record_number_check
  CHECK (record_number BETWEEN 2 AND 5 OR (machine_id = 58 AND record_number = 6));
