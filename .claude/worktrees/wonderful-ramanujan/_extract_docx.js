const fs = require("fs");
const zlib = require("zlib");

function readDocx(filepath) {
  const buf = fs.readFileSync(filepath);
  let cdEnd = buf.length - 22;
  while (cdEnd >= 0) {
    if (buf[cdEnd] === 0x50 && buf[cdEnd+1] === 0x4b && buf[cdEnd+2] === 0x05 && buf[cdEnd+3] === 0x06) break;
    cdEnd--;
  }
  if (cdEnd < 0) return "Could not find end of central directory";

  const cdOffset = buf.readUInt32LE(cdEnd + 16);
  const cdCount = buf.readUInt16LE(cdEnd + 8);
  let pos = cdOffset;
  const entries = [];

  for (let i = 0; i < cdCount; i++) {
    if (buf[pos] !== 0x50 || buf[pos+1] !== 0x4b) break;
    const fnLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const method = buf.readUInt16LE(pos + 10);
    const compSize = buf.readUInt32LE(pos + 20);
    const uncompSize = buf.readUInt32LE(pos + 24);
    const fname = buf.slice(pos + 46, pos + 46 + fnLen).toString("utf8");
    entries.push({ fname, localOffset, method, compSize, uncompSize });
    pos += 46 + fnLen + extraLen + commentLen;
  }

  const docEntry = entries.find(e => e.fname === "word/document.xml");
  if (!docEntry) return "No word/document.xml found";

  let lpos = docEntry.localOffset;
  const lfnLen = buf.readUInt16LE(lpos + 26);
  const lextraLen = buf.readUInt16LE(lpos + 28);
  const dataStart = lpos + 30 + lfnLen + lextraLen;

  let xmlBuf;
  if (docEntry.method === 8) {
    xmlBuf = zlib.inflateRawSync(buf.slice(dataStart, dataStart + docEntry.compSize));
  } else {
    xmlBuf = buf.slice(dataStart, dataStart + docEntry.uncompSize);
  }

  const xml = xmlBuf.toString("utf8");
  const paras = xml.split("</w:p>");
  const allText = [];
  for (const para of paras) {
    let paraText = "";
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let m;
    while ((m = tRegex.exec(para)) !== null) {
      paraText += m[1];
    }
    if (paraText.trim()) allText.push(paraText.trim());
  }
  return allText.join("\n");
}

const base = "C:/Users/JDTKD/OneDrive - H&C EXECUTIVE EDUCATION/Bureau";
console.log("=== FEUILLE DE LANCEMENT ===");
console.log(readDocx(base + "/afrikalytics_feuille_lancement.docx"));
console.log();
console.log("=== MATRICE DE PILOTAGE ===");
console.log(readDocx(base + "/afrikalytics_matrice_pilotage.docx"));
