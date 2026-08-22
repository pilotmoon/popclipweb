// Read an mp4's pixel dimensions from its tkhd atom, for the Featured
// box's aspect-ratio gate (demo videos vary; ultra-wide strips don't
// suit a box). Pure box walking, no decoder: moov -> trak -> tkhd, whose
// width and height are 16.16 fixed-point at a fixed offset. Runs in the
// build-time data loader only, once per candidate demo.

function walk(
  buf: Buffer,
  start: number,
  end: number,
  visit: (type: string, bodyStart: number, boxEnd: number) => boolean,
) {
  let i = start;
  while (i + 8 <= end) {
    let size = buf.readUInt32BE(i);
    const type = buf.toString("latin1", i + 4, i + 8);
    let header = 8;
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(i + 8));
      header = 16;
    } else if (size === 0) {
      size = end - i;
    }
    if (size < header) return;
    if (visit(type, i + header, i + size)) return;
    i += size;
  }
}

// width / height, or null if no video track header is found
export function mp4Aspect(data: ArrayBuffer): number | null {
  const buf = Buffer.from(data);
  let aspect: number | null = null;
  walk(buf, 0, buf.length, (type, a, b) => {
    if (type !== "moov") return false;
    walk(buf, a, b, (t2, a2, b2) => {
      if (t2 !== "trak") return false;
      walk(buf, a2, b2, (t3, a3) => {
        if (t3 !== "tkhd") return false;
        const version = buf[a3];
        const offset = a3 + (version === 0 ? 76 : 88);
        const width = buf.readUInt32BE(offset) / 65536;
        const height = buf.readUInt32BE(offset + 4) / 65536;
        if (width > 0 && height > 0) {
          aspect = width / height;
          return true;
        }
        return false;
      });
      return aspect !== null;
    });
    return true;
  });
  return aspect;
}
