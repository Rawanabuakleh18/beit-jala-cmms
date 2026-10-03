const fs = require('node:fs');
const { createRequire } = require('node:module');
const { Client } = createRequire(require('node:path').resolve('lib/db/package.json'))('pg');

const purchasedName = 'a- Rota Verpa Ckung Stechnik GmbH&cokg';
const purchasedAddress = 'b-Oflinger str,118-79664wehr tel 077621708-\nfax077621708-126';
const manufacturerName = 'a- Rota Verpa Ckung Stechnik GmbH &cokg';
const manufacturerAddress = 'b- Oflinger,str,118-79664wehr tel077621708\nfax077621708-126';
const safety = 'Disconnect the electrical plug from the main power supply before performing any maintenance and cleaning';

const additional = {
  2: {
    nameOfEquipment: 'AMPOULES Filling Line/ Rota\nSterilization tunel',
    modelNumber: 'RT 400/900', serialNumber: '38', identificationNumber: 'PDM-08-081 B', datePurchased: '2015',
    purchasedFromName: purchasedName, purchasedFromAddress: purchasedAddress,
    manufacturingCompanyName: manufacturerName, manufacturingCompanyAddress: manufacturerAddress,
    dimensionWidthCm: null, dimensionHeightCm: null, dimensionDepthCm: null,
    dimensionsNote: 'W-2984 mm\nD--1600mm\nH-2305 mm', weightKg: null, weightNote: '2600Kg',
    utilitiesPowerSupply: '3l/n/pe-230/400 V+-10% -50hz-current65A', utilitiesAir: '2-6 bar',
    utilitiesWater: 'NW 1.55m3/h at12c/2c', utilitiesOther: 'Approx 75 dB',
    others: '11.5 . Max working temperature in normal mode\n11.6 .',
    othersDetails: 'Infeed zone 40c\nSterilization zone up to 350c\nCooling zone 40c',
    safetyIssues: safety, safetyIssuesDetails: '',
  },
  3: {
    nameOfEquipment: 'AMPOULES Filling Line/ Rota\nFilling &Closing',
    modelNumber: 'R921MA-K', serialNumber: '47', identificationNumber: 'PDM-08-081 C', datePurchased: '2015',
    purchasedFromName: purchasedName, purchasedFromAddress: purchasedAddress,
    manufacturingCompanyName: manufacturerName, manufacturingCompanyAddress: manufacturerAddress,
    dimensionWidthCm: null, dimensionHeightCm: null, dimensionDepthCm: null,
    dimensionsNote: 'N,A', weightKg: null, weightNote: 'N,A',
    utilitiesPowerSupply: '3l/n/pe-230/400 V+-10% -50hz-', utilitiesAir: '6 bar',
    utilitiesWater: 'WFI', utilitiesOther: 'Approx 75 dB',
    others: '11.5 . Ampoul Filling Size\n11.6 . Max output Ampoules',
    othersDetails: '1ml/10 ml\n6000 Ampoules', safetyIssues: safety, safetyIssuesDetails: '',
  },
};

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('BEGIN');
    const machine = (await client.query("SELECT id, machine_number FROM machines WHERE id=106 FOR UPDATE")).rows;
    if (machine.length !== 1) throw new Error(`Expected machine 106, found ${machine.length}`);
    const machineId = machine[0].id;
    const original = (await client.query('SELECT * FROM equipment_information_records WHERE machine_id=$1 FOR UPDATE', [machineId])).rows;
    const extras = (await client.query('SELECT * FROM additional_equipment_records WHERE machine_id=$1 ORDER BY record_number FOR UPDATE', [machineId])).rows;
    if (original.length !== 1 || extras.length !== 2) throw new Error('Expected one original and two additional records');
    fs.writeFileSync(`backups/pdm08081-three-records-before-${Date.now()}.json`, JSON.stringify({ original, extras }, null, 2), { flag: 'wx' });

    await client.query(`
      UPDATE equipment_information_records SET
        name_of_equipment='AMPOULES Filling Line/ Rota\nWashing Machine', model_number='RWM-180', serial_number='46',
        identification_number='PDM-08-081 A', date_purchased='2015', purchased_from_name=$1,
        purchased_from_address=$2, manufacturing_company_name=$3, manufacturing_company_address=$4,
        dimension_width_cm=NULL, dimension_height_cm=NULL, dimension_depth_cm=NULL,
        dimensions_note='Length -2564mm\nBreadth-1818mm\nHeight-900+-15mm', weight_kg=NULL, weight_note='1950 Kg net',
        utilities_power_supply='380 volt A.C 50 HZ', utilities_air='6-8 bar',
        utilities_water='WFI -90Cmax -3/4 bar-340 L/h at 3bar', utilities_other='<85 dB',
        others='11.5 .\n11.6 .', others_details='', safety_issues=$5, safety_issues_details='', updated_at=NOW()
      WHERE machine_id=$6
    `, [purchasedName, purchasedAddress, manufacturerName, manufacturerAddress, safety, machineId]);

    for (const [recordNumber, data] of Object.entries(additional)) {
      await client.query(`UPDATE additional_equipment_records SET data=$1::jsonb, updated_at=NOW() WHERE machine_id=$2 AND record_number=$3`, [JSON.stringify(data), machineId, Number(recordNumber)]);
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({ machineId, correctedRecords: [1, 2, 3] }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { await client.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
