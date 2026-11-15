import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parseDgtLine } from '../lib/dgtParser';
import { DgtRecord } from '../lib/dgtTypes';

async function main() {
  const args = process.argv.slice(2);
  let filePath = path.join(process.cwd(), 'export_mensual_mat_202610.txt');
  let limit = 10000;
  let outputPath: string | null = path.join(process.cwd(), 'public', 'data', 'dgt-sample.json');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      filePath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = path.resolve(args[i + 1]);
      i++;
    }
  }

  console.log('='.repeat(60));
  console.log(' DGT PULSE // TELEMETRY & FLEET ANALYTICS INGESTOR');
  console.log('='.repeat(60));
  console.log(`[INFO] Reading source file: ${filePath}`);
  console.log(`[INFO] Record limit: ${limit}`);

  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] File not found: ${filePath}`);
    process.exit(1);
  }

  const startTime = Date.now();
  const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const records: DgtRecord[] = [];
  let totalLines = 0;
  let parsedCount = 0;
  let skippedCount = 0;

  const brandCounts: Record<string, number> = {};
  const fuelCounts: Record<string, number> = {};
  const badgeCounts: Record<string, number> = {};
  let totalCo2 = 0;
  let co2Samples = 0;

  for await (const line of rl) {
    totalLines++;
    if (totalLines === 1 && (line.includes('Vehículos') || line.includes('Vehculos'))) {
      console.log(`[HEADER DETECTED] ${line.substring(0, 70)}...`);
      continue;
    }

    const record = parseDgtLine(line, totalLines);
    if (record) {
      records.push(record);
      parsedCount++;

      // Stats
      brandCounts[record.marca] = (brandCounts[record.marca] || 0) + 1;
      fuelCounts[record.propulsion] = (fuelCounts[record.propulsion] || 0) + 1;
      badgeCounts[record.etiquetaDgt] = (badgeCounts[record.etiquetaDgt] || 0) + 1;

      if (record.emisionesCo2 > 0) {
        totalCo2 += record.emisionesCo2;
        co2Samples++;
      }
    } else {
      skippedCount++;
    }

    if (parsedCount >= limit) {
      break;
    }

    if (totalLines % 2000 === 0) {
      process.stdout.write(`\r[INGESTING] ${totalLines} lines processed | ${parsedCount} valid records...`);
    }
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '-'.repeat(60));
  console.log(`[SUCCESS] Ingest completed in ${elapsedSec}s`);
  console.log(`- Total lines read: ${totalLines}`);
  console.log(`- Valid parsed records: ${parsedCount}`);
  console.log(`- Skipped/Header lines: ${skippedCount}`);

  // Top 5 Brands
  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  console.log('\n[TELEMETRY] Top 5 Registered Brands:');
  topBrands.forEach(([brand, count], idx) => {
    const pct = ((count / parsedCount) * 100).toFixed(1);
    console.log(`  ${idx + 1}. ${brand.padEnd(20)} ${count} regs (${pct}%)`);
  });

  // Fuel distribution
  console.log('\n[TELEMETRY] Propulsion Distribution:');
  Object.entries(fuelCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([fuel, count]) => {
      const pct = ((count / parsedCount) * 100).toFixed(1);
      console.log(`  - ${fuel.padEnd(25)}: ${count} (${pct}%)`);
    });

  // DGT Environmental Badges
  console.log('\n[TELEMETRY] DGT Environmental Badges:');
  Object.entries(badgeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([badge, count]) => {
      const pct = ((count / parsedCount) * 100).toFixed(1);
      console.log(`  - ${badge.padEnd(15)}: ${count} (${pct}%)`);
    });

  if (co2Samples > 0) {
    const avgCo2 = (totalCo2 / co2Samples).toFixed(1);
    console.log(`\n[TELEMETRY] Fleet Avg CO2: ${avgCo2} g/km`);
  }

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2), 'utf-8');
    const fileSizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
    console.log(`\n[OUTPUT] Exported ${records.length} records to ${outputPath} (${fileSizeMb} MB)`);
  }

  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
