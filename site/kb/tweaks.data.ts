import fs from "node:fs";
import { defineLoader } from "vitepress";
import { z } from "zod";

// extras/tweaks.json is copied from the PopClip repo's Docs/tweaks.json by
// `npm run tweaks:sync`. PopClip generates it from its Tweak list.
const ZTweak = z.object({
  key: z.string(),
  type: z.enum(["bool", "number", "string", "choice"]),
  listing: z.enum(["general", "experiments", "troubleshooting"]),
  timing: z.enum(["live", "restart", "oneShot"]),
  default: z.union([z.boolean(), z.number(), z.string()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  unit: z.string().optional(),
  choices: z.array(z.string()).optional(),
  summary: z.string(),
});
type Tweak = z.infer<typeof ZTweak>;

const ZTweaksFile = z.object({ tweaks: z.array(ZTweak) });

export type TweakRow = Tweak & {
  summaryHtml: string;
  defaultText: string;
  rangeText: string | null;
  writeCommand: string;
};

export type TweakSection = {
  id: Tweak["listing"];
  title: string;
  description: string;
  tweaks: TweakRow[];
};

type TweaksData = { sections: TweakSection[] };
declare const data: TweaksData;
export { data };

const SECTIONS: Omit<TweakSection, "tweaks">[] = [
  {
    id: "general",
    title: "General",
    description: "Fine-tune how PopClip and its bar behave.",
  },
  {
    id: "experiments",
    title: "Experiments",
    description:
      "Behaviors that are still being tried out. They may change or go away.",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description:
      "Turn off or change parts of PopClip to work around a problem. Usually you'd change these only when support asks.",
  },
];

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Summaries mark code with `backticks`.
function summaryHtml(summary: string): string {
  return escapeHtml(summary).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function formatValue(tweak: Tweak, value: Tweak["default"]): string {
  if (typeof value === "boolean") return value ? "YES" : "NO";
  if (value === undefined) return "not set";
  return tweak.unit ? `${value} ${tweak.unit}` : String(value);
}

function writeCommand(tweak: Tweak): string {
  const prefix = `defaults write com.pilotmoon.popclip ${tweak.key}`;
  switch (tweak.type) {
    case "bool":
      // The useful command sets the opposite of the default.
      return `${prefix} -bool ${tweak.default === true ? "NO" : "YES"}`;
    case "number":
      return `${prefix} -float <number>`;
    default:
      return `${prefix} -string <text>`;
  }
}

export default defineLoader({
  watch: ["../../extras/tweaks.json"],
  load(watchedFiles): TweaksData {
    const file = ZTweaksFile.parse(
      JSON.parse(fs.readFileSync(watchedFiles[0], "utf-8")),
    );
    const sections = SECTIONS.map((section) => ({
      ...section,
      tweaks: file.tweaks
        .filter((tweak) => tweak.listing === section.id)
        .map((tweak) => ({
          ...tweak,
          summaryHtml: summaryHtml(tweak.summary),
          defaultText: formatValue(tweak, tweak.default),
          rangeText:
            tweak.min !== undefined && tweak.max !== undefined
              ? `${formatValue(tweak, tweak.min)} to ${formatValue(tweak, tweak.max)}`
              : null,
          writeCommand: writeCommand(tweak),
        })),
    }));
    return {
      sections: sections.filter((section) => section.tweaks.length > 0),
    };
  },
});
