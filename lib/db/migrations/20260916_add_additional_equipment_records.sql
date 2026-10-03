CREATE TABLE IF NOT EXISTS additional_equipment_records (
  id serial PRIMARY KEY,
  machine_id integer NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  record_number integer NOT NULL CHECK (record_number BETWEEN 2 AND 5),
  data jsonb NOT NULL DEFAULT '{}',
  header jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS additional_equipment_machine_number_idx
ON additional_equipment_records(machine_id, record_number);
