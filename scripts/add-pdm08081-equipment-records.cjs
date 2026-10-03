const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const safety = 'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning';
const companyName = 'a- Rota Verpa Ckung Stechnik GmbH &cokg';
const companyAddress = 'b- Oflinger str,118-79664wehr tel 077621708-\nfax077621708-126';

const records = [
  {
    recordNumber: 2,
    data: {
      nameOfEquipment: 'AMPOULES Filling Line/ Rota\nSterilization tunel',
      modelNumber: 'RT 400/900',
      serialNumber: '38',
      identificationNumber: 'PDM-08-081 B',
      datePurchased: '2015',
      purchasedFromName: companyName,
      purchasedFromAddress: companyAddress,
      manufacturingCompanyName: companyName,
      manufacturingCompanyAddress: companyAddress,
      dimensionWidthCm: null,
      dimensionHeightCm: null,
      dimensionDepthCm: null,
      dimensionsNote: 'W-2984 mm\nD--1600mm\nH-2305 mm',
      weightKg: null,
      weightNote: '2600Kg',
      utilitiesPowerSupply: '3l/n/pe-230/400 V+-10% -50hz-current65A',
      utilitiesAir: '2-6 bar',
      utilitiesWater: 'NW 1.55m3/h at12c/2c',
      utilitiesOther: 'Approx 75 dB',
      others: '11.5 . Max working temperature in normal mode\n11.6 .',
      othersDetails: 'Infeed zone 40c\nSterilization zone up to 350c\nCooling zone 40c',
      safetyIssues: safety,
      safetyIssuesDetails: '',
    },
  },
  {
    recordNumber: 3,
    data: {
      nameOfEquipment: 'AMPOULES Filling Line/ Rota\nFilling &Closing',
      modelNumber: 'R921MA-K',
      serialNumber: '47',
      identificationNumber: 'PDM-08-081 C',
      datePurchased: '2015',
      purchasedFromName: companyName,
      purchasedFromAddress: companyAddress,
      manufacturingCompanyName: companyName,
      manufacturingCompanyAddress: companyAddress,
      dimensionWidthCm: null,
      dimensionHeightCm: null,
      dimensionDepthCm: null,
      dimensionsNote: 'N,A',
      weightKg: null,
      weightNote: 'N,A',
      utilitiesPowerSupply: '3l/n/pe-230/400 V+-10% -50hz-',
      utilitiesAir: '6 bar',
      utilitiesWater: 'WFI',
      utilitiesOther: 'Approx 75 dB',
      others: '11.5 . Ampoul Filling Size\n11.6 . Max output Ampoules',
      othersDetails: '1ml/10 ml\n6000 Ampoules',
      safetyIssues: safety,
      safetyIssuesDetails: '',
    },
  },
];

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machines = (await client.query(`
      SELECT id, machine_number, machine_name FROM machines
      WHERE regexp_replace(upper(machine_number), '\\s', '', 'g') = 'PDM-08-081A'
        AND deleted_at IS NULL
      FOR UPDATE
    `)).rows;
    if (machines.length !== 1) throw new Error(`Expected one PDM-08-081 A machine, found ${machines.length}`);
    const machine = machines[0];

    const existing = (await client.query(
      'SELECT * FROM additional_equipment_records WHERE machine_id=$1 ORDER BY record_number FOR UPDATE',
      [machine.id],
    )).rows;
    if (existing.length) throw new Error('PDM-08-081 A already has additional equipment records; nothing was changed');
    fs.writeFileSync(
      `backups/pdm08081-additional-records-before-${Date.now()}.json`,
      JSON.stringify({ machine, existing }, null, 2),
      { flag: 'wx' },
    );

    const formHeader = (await client.query(`
      SELECT company_name, document_name, document_number,
             effective_or_execution_date, page_number, total_pages
      FROM form_headers
      WHERE document_type='EQUIPMENT_INFORMATION' AND document_id=$1
    `, [machine.id])).rows[0];
    const header = {
      companyName: formHeader?.company_name || 'Beit Jala Pharmaceutical Co.',
      documentName: formHeader?.document_name || 'Equipment Information Record',
      documentNumber: formHeader?.document_number || 'FORM-10-0118',
      effectiveOrExecutionDate: formHeader?.effective_or_execution_date || null,
      pageNumber: formHeader?.page_number || 1,
      totalPages: formHeader?.total_pages || 1,
    };

    for (const record of records) {
      await client.query(`
        INSERT INTO additional_equipment_records
          (machine_id, record_number, data, header)
        VALUES ($1, $2, $3::jsonb, $4::jsonb)
      `, [machine.id, record.recordNumber, JSON.stringify(record.data), JSON.stringify(header)]);
    }

    const saved = (await client.query(`
      SELECT record_number, data->>'identificationNumber' AS identification_number
      FROM additional_equipment_records
      WHERE machine_id=$1 ORDER BY record_number
    `, [machine.id])).rows;
    if (saved.length !== 2 || saved[0].identification_number !== 'PDM-08-081 B' || saved[1].identification_number !== 'PDM-08-081 C') {
      throw new Error('Additional equipment record verification failed');
    }

    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId: machine.id, machineNumber: machine.machine_number, records: ['A', 'B', 'C'] }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
