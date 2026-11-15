import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { parseDgtLine } from '../lib/dgtParser';

const zipPath = 'C:/Users/jpber/Downloads/export_mensual_mat_202401.zip';
console.log('Testing zip extraction:', zipPath);

const zip = new AdmZip(zipPath);
const entries = zip.getEntries();
console.log('Entry:', entries[0].entryName, 'Size:', (entries[0].header.size / 1024 / 1024).toFixed(2), 'MB');

const text = entries[0].getData().toString('latin1');
const lines = text.split(/\r?\n/);
console.log('Total lines in 2024-01:', lines.length);

let valid = 0;
for (let i = 1; i <= 50; i++) {
  const r = parseDgtLine(lines[i], i);
  if (r) valid++;
}
console.log('Parsed first 50 lines:', valid, 'valid records');
