// date formetter for headings
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Europe/London",
  });
}

// format size in bytes to megabytes with 2 decimal places
export function formatSize(size: number) {
  return size ? (size / 1024 / 1024).toFixed(2) + " Mb" : "";
}

export function formatArchs(archs) {
  return "Processors: " + archs.map((a) => {
    if (a === "arm64") return "Apple Silicon";
    if (a === "x86_64") return "Intel 64-bit";
    if (a === "i386") return "Intel 32-bit";
    return a;
  }).join(", ");
}
