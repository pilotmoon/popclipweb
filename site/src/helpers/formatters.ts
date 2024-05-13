// date formetter for headings
export function formatDate(dateStringOrDate: string | Date | null) {
  if (!dateStringOrDate) return "<no date>";
  return new Date(dateStringOrDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Europe/London",
  });
}

// format size in bytes to megabytes with 2 decimal places
export function formatSize(size: number) {
  return size ? `${(size / 1024 / 1024).toFixed(2)} Mb` : "";
}

export function formatArchs(archs) {
  if (!archs) return "";
  return (
    `Processor${archs.length > 1 ? "s" : ""}: ${archs
      .map((a) => {
        if (a === "arm64") return "Apple Silicon";
        if (a === "x86_64") return "Intel 64-bit";
        if (a === "i386") return "Intel 32-bit";
        return a;
      })
      .join(", ")}`
  );
}
