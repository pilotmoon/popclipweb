<script setup lang="ts">
import type { ExtInfo } from "./data/extensionInfo";
import { data as exts } from "./data/extensions.data";
import { data as directoryData, type Section } from "./data/directory.data";
import { IconLink, IconSearch } from "@tabler/icons-vue";
import DirectoryEntry from "./DirectoryEntry.vue";
import FeaturedExtension from "./FeaturedExtension.vue";
import { ElInput, ElRadioButton, ElRadioGroup, ElTag } from "element-plus";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useData } from "vitepress";
import { useDebounceFn } from "@vueuse/core";

import {
  DEFAULT_CATEGORY_LIMIT,
  FEATURED_MAX_ASPECT,
  FEATURED_MIN_ASPECT,
  FEATURED_RANK_FRACTION,
  NEW_PER_CATEGORY_LIMIT,
  NEW_WINDOW_DAYS,
  NEWLY_ADDED_LIMIT,
  WILDCARD_PER_CATEGORY_LIMIT,
} from "./directoryTuning.js";
import { byName, byRank } from "./directoryOrder.js";

const categoryDefs = directoryData.categories;

// filter/arrange state
const defaultFilter = "";
const filter = ref(defaultFilter);
const defaultArrange = "categories";
const arrange = ref(defaultArrange);

// searching always covers everything, unlisted extensions included:
// search intent is "does it exist?", and a search that misses a
// published extension reads as "no". browsing shows the curated index
// only -- there is deliberately no browse toggle for unlisted; the
// trailing Unlisted Extensions section exists only in search results.
const searching = computed(() => filter.value !== defaultFilter);

// every published extension, keyed by identifier
const allMap = new Map(
  exts.map((e) => [
    e.identifier,
    {
      ...e,
      firstCreated: new Date(e.firstCreated),
      created: new Date(e.created),
      updatedDate: new Date(e.sourceDate ?? 0),
      // when the extension entered the directory index; firstCreated
      // fallback covers records predating the firstListed field
      listedDate: new Date(e.firstListed ?? e.firstCreated),
    },
  ]),
);

// the extensions currently in play
const extsMap = computed(
  () =>
    new Map([...allMap].filter(([, e]) => searching.value || !e.unlisted)),
);

// deterministic per-build randomness: seeded from the build date and a
// salt, so server render and client hydration agree exactly, while the
// hourly site rebuilds rotate the selection daily. used for the
// serendipity slots in each category section (see categoriesIndex).
function seededRandom(seedString: string) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// a seeded random pick of n items
function randomPick(list: ExtInfo[], n: number, salt: string): ExtInfo[] {
  if (n <= 0) return [];
  if (list.length <= n) return [...list];
  const rand = seededRandom(`${directoryData.day}:${salt}`);
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// newly listed, relative to the build date
const newCutoff =
  new Date(directoryData.day).getTime() - NEW_WINDOW_DAYS * 24 * 3600 * 1000;
function isNewlyListed(e: ExtInfo & { firstListed?: unknown }) {
  return (
    e.firstListed != null && new Date(e.firstListed as string | Date).getTime() > newCutoff
  );
}

// the Featured box: one extension a day from the pool of listed
// extensions with an mp4 demo of a box-friendly aspect ratio, in the
// top fraction of the ranking. a
// deterministic daily ROUND-ROBIN rather than a random draw, so every
// eligible extension gets its turn (random would repeat and skip); the
// pool is sorted by identifier so the sequence is stable as it changes.
// seeded from the build date like the serendipity picks, so server and
// client agree.
const featured = computed<ExtInfo | null>(() => {
  const listed = [...allMap.values()].filter((e) => !e.unlisted);
  const rankedCount = listed.filter((e) => e.popularity).length;
  const cutoff = Math.ceil(rankedCount * FEATURED_RANK_FRACTION);
  const pool = listed
    .filter(
      (e) =>
        e.featurable !== false && // the curation veto, on the family
        e.demo?.endsWith(".mp4") &&
        e.demoAspect != null &&
        e.demoAspect >= FEATURED_MIN_ASPECT &&
        e.demoAspect <= FEATURED_MAX_ASPECT &&
        e.popularity != null &&
        e.popularity.rank <= cutoff,
    )
    .sort((a, b) => a.identifier.localeCompare(b.identifier));
  if (pool.length === 0) return null;
  const dayIndex = Math.floor(Date.parse(directoryData.day) / 86_400_000);
  return pool[dayIndex % pool.length];
});

// define the arrangements
const alphaSection = computed<Section>(() => ({
  title: "All Extensions (Alphabetical)",
  members: [...extsMap.value.values()].sort(byName).map((e) => e.identifier),
}));
// the download ranking across the whole directory, as one list
const popularSection = computed<Section>(() => ({
  title: "All Extensions (Most popular first)",
  members: [...extsMap.value.values()].sort(byRank).map((e) => e.identifier),
}));
// "newest" means newest in the directory: ordered by when each extension
// was listed, not when it was first published (the two differ for
// extensions that spent time published-but-unlisted). unlisted
// extensions, when shown, order by their first-publication fallback
const newestSection = computed<Section>(() => ({
  title: "All Extensions (Newest first)",
  members: [...extsMap.value.values()]
    .sort((a, b) => b.listedDate.getTime() - a.listedDate.getTime())
    .map((e) => e.identifier),
}));
const updatedSection = computed<Section>(() => ({
  title: "All Extensions (Recently updated first)",
  members: [...extsMap.value.values()]
    .sort((a, b) => b.updatedDate.getTime() - a.updatedDate.getTime())
    .map((e) => e.identifier),
}));
// the tail sections (Not Categorized, Unlisted): flagships first, then
// the rest, each group A-Z. category sections order by popularity
// instead -- see categoriesIndex
function sectionOrder(list: ExtInfo[]): string[] {
  return list
    .sort(
      (a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0) || byName(a, b),
    )
    .map((e) => e.identifier);
}

const categoriesIndex = computed<Section[]>(() => {
  const newest = {
    title: "Newly Added",
    members: newestSection.value.members.slice(0, NEWLY_ADDED_LIMIT),
    link: "#a=newest",
    special: true,
  };
  // group the listed extensions by category slug. an unlisted extension
  // may carry a category (staged for when it is listed), but while
  // unlisted it appears only in search results
  const bySlug = new Map<string, ExtInfo[]>();
  for (const ext of extsMap.value.values()) {
    if (ext.unlisted || !ext.category) continue;
    const list = bySlug.get(ext.category) ?? [];
    list.push(ext);
    bySlug.set(ext.category, list);
  }
  const sections: Section[] = [];
  for (const def of categoryDefs) {
    const members = bySlug.get(def.slug);
    if (members) {
      // the visible SELECTION is a formation: every flagship, then up to
      // a few New! entries, then the rest of the category's slots filled
      // by download rank -- except the last couple, which are daily-
      // rotating serendipity picks drawn from members the ranking would
      // NOT have surfaced, so nothing is ever permanently buried.
      // flagships and new entries always fit, even past the limit.
      //
      // the visible ORDER is then simply popularity, whoever got in and
      // however: flagships tend to be popular so they tend to lead, and
      // unranked entries (new, or never downloaded) sit at the bottom
      // until downloads carry them up.
      const limit = def.frontPageLimit ?? DEFAULT_CATEGORY_LIMIT;
      const flagships = members.filter((m) => m.flagship);
      // the new slots go to the NEWEST few; any further new entries
      // compete for the remaining slots like everyone else
      const fresh = members
        .filter((m) => !m.flagship && isNewlyListed(m))
        .sort(
          (a, b) =>
            new Date(b.firstListed as string | Date).getTime() -
            new Date(a.firstListed as string | Date).getTime(),
        )
        .slice(0, NEW_PER_CATEGORY_LIMIT);
      const rest = members.filter(
        (m) => !m.flagship && !fresh.includes(m),
      );
      const slots = Math.max(0, limit - flagships.length - fresh.length);
      const byPopularity = [...rest].sort(byRank);
      // reserve the wildcard slots, but only if there is anyone left to
      // be a wildcard: a small category just shows its ranked members.
      // the pool is everyone below the RANKED cut -- including the two
      // the wildcards displaced -- so every member not shown on merit
      // has the same chance, and nobody is permanently buried
      const wildcardSlots = Math.min(
        WILDCARD_PER_CATEGORY_LIMIT,
        slots,
        Math.max(0, byPopularity.length - slots),
      );
      const ranked = byPopularity.slice(0, slots - wildcardSlots);
      const pool = byPopularity.slice(slots - wildcardSlots);
      const wildcards = randomPick(pool, wildcardSlots, `${def.slug}:wild`);
      const visible = [...flagships, ...fresh, ...ranked, ...wildcards].sort(
        byRank,
      );
      // the footer link only exists when there is genuinely more to see,
      // and its count says so: "View all 17 in ..."
      const truncated = visible.length < members.length;
      sections.push({
        title: def.title,
        members: visible.map((e) => e.identifier),
        // search covers the whole membership, not just the selection,
        // in the same popularity order
        fullMembers: [...members].sort(byRank).map((e) => e.identifier),
        // every category heading reveals a link to its page on hover;
        // the counted footer appears only when truncated
        pageLink: `/extensions/categories/${def.slug}`,
        ...(truncated
          ? {
              link: `/extensions/categories/${def.slug}`,
              linkText: `View all ${members.length} in "${def.title}" →`,
            }
          : {}),
      });
      bySlug.delete(def.slug);
    }
  }
  // always-visible tail section: anything listed but not claimed by a
  // category above (no category, or a slug that no longer exists) --
  // this is where curation gaps show themselves. never truncated.
  const leftovers = [
    ...[...bySlug.values()].flat(),
    ...[...extsMap.value.values()].filter((e) => !e.unlisted && !e.category),
  ];
  if (leftovers.length) {
    sections.push({
      title: "Not Categorized",
      members: sectionOrder(leftovers),
    });
  }
  // unlisted extensions surface only in search results (extsMap contains
  // them only while searching), as a section of their own at the bottom
  // so curated matches lead
  const unlisted = [...extsMap.value.values()].filter((e) => e.unlisted);
  const unlistedSection: Section[] = unlisted.length
    ? [{ title: "Unlisted Extensions", members: sectionOrder(unlisted) }]
    : [];
  return [newest, ...sections, ...unlistedSection];
});
const arrangements = computed(
  () =>
    new Map([
      ["categories", { label: "Categories", index: categoriesIndex.value }],
      ["popular", { label: "Popular", index: [popularSection.value] }],
      ["newest", { label: "New", index: [newestSection.value] }],
      ["updated", { label: "Updated", index: [updatedSection.value] }],
      ["alpha", { label: "A–Z", index: [alphaSection.value] }],
    ]),
);

// total number of extensions in the current scope: the curated count
// normally, everything when unlisted are shown (or while searching,
// which always covers everything)
const total = computed(() => extsMap.value.size);

// track filter term
const trackFilterTerm = useDebounceFn(() => {
  if (filter.value.length < 3) return;
  // va.track("Filter", { query: filter.value });
}, 1000);

// page title
const {
  title: { value: initialTitle },
} = useData();
function title() {
  const parts: string[] = [];
  if (arrange.value !== defaultArrange) {
    parts.push(arrangements.value.get(arrange.value)?.label || arrange.value);
  }
  if (filter.value !== defaultFilter) {
    parts.push(`"${filter.value}"`);
  }
  if (parts.length > 0) {
    return `${initialTitle}: ${parts.join(", ")}`;
  }
  return initialTitle;
}

// get params from url
function readParams() {
  return new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
}

// weite params to url, and update the filter
function writeParams(params: URLSearchParams) {
  trackFilterTerm();

  // update the url hash
  const url = new URL(window.location.toString());
  url.hash = params.toString();
  window.history.replaceState({}, "", url.toString());

  // update the title
  window.document.title = title();

  // update the filter
  arrange.value = params.get("a") || defaultArrange;
  filter.value = params.get("q") || defaultFilter;
}

// watch filter/arrange change
watch([filter, arrange], ([newFilter, newArrange]) => {
  const params = new URLSearchParams();
  if (newArrange !== defaultArrange) {
    params.set("a", newArrange);
  }
  if (newFilter !== defaultFilter) {
    params.set("q", newFilter);
  }
  writeParams(params);
});

// on hash change
function onHashChange() {
  console.log("onHashChange");
  writeParams(readParams());
}

// mount/unmount
onMounted(() => {
  onHashChange();
  window.addEventListener("hashchange", onHashChange);
});
onBeforeUnmount(() => {
  window.removeEventListener("hashchange", onHashChange);
});

const selectedIndex = computed(() => {
  return arrangements.value.get(arrange.value)?.index ?? [];
});

const filteredIndex = computed(() => {
  const uniques = new Set<string>();
  const index: {
    title: string;
    link?: string;
    linkText?: string;
    pageLink?: string;
    extensions: ExtInfo[];
  }[] = [];
  const all = new Set<string>(arrangements.value.get("alpha")?.index[0].members);
  const filterValue = filter.value.toLowerCase();
  // every typed word must match somewhere in the extension's terms, in
  // any order and each as a substring ("markdown html" and
  // "html markdown" find the same things, and a half-typed word matches
  // as you go). splitting also makes stray whitespace harmless
  const words = filterValue.split(/\s+/).filter(Boolean);
  const matches = (terms: string | null | undefined) =>
    words.every((w) => terms?.includes(w));
  for (const section of selectedIndex.value) {
    if (filterValue && section.special) {
      continue;
    }
    // searching covers the complete membership; browsing shows the
    // (possibly truncated) selection. no limits apply while searching.
    const memberList =
      filterValue && section.fullMembers
        ? section.fullMembers
        : section.members;
    const extensions: ExtInfo[] = [];
    for (const identifier of memberList) {
      const ext = extsMap.value.get(identifier);
      if (ext && matches(ext.filterTerms)) {
        extensions.push(ext);
        uniques.add(identifier);
      }
      all.delete(identifier);
    }
    if (extensions.length > 0) {
      // while searching, the complete membership is already on show, so
      // the "View all" footer link would point at nothing extra
      index.push({
        title: section.title,
        ...(filterValue
          ? {}
          : {
              link: section.link,
              linkText:
                section.linkText ?? `View all in "${section.title}" →`,
            }),
        pageLink: section.pageLink,
        extensions,
      });
    }
  }
  // if user has typed a search filter, add any remaining extensions in extras section
  if (filterValue && all.size > 0) {
    const extensions: ExtInfo[] = [];
    for (const identifier of all) {
      const ext = extsMap.value.get(identifier);
      if (ext && matches(ext.filterTerms)) {
        extensions.push(ext);
        uniques.add(identifier);
      }
    }
    if (extensions.length > 0) {
      index.push({
        title: "Uncategorized",
        extensions,
      });
    }
  }
  return { index, count: uniques.size };
});
</script>

<template>
  <div :class="$style.Links">
    <a href="/extensions/submit">Submit</a> ·
    <a href="/extensions/authors/">Authors</a> ·
    <a href="https://public.popclip.app/extensions/popclip.rss">RSS</a>
  </div>
  <h1>PopClip Extensions Directory</h1>
  <div :class="$style.Directory">
    <div :class="$style.Header">
      <div :class="$style.Control">
        Arrange:
        <!-- tabs come from the arrangements map, in its order -->
        <ElRadioGroup v-model="arrange">
          <ElRadioButton
            v-for="[key, { label }] in arrangements"
            :key="key"
            :label="key"
            >{{ label }}</ElRadioButton
          >
        </ElRadioGroup>
      </div>
      <div :class="$style.Control">
        Search:
        <ElInput
          v-model="filter"
          placeholder="Type to search"
          :prefix-icon="IconSearch"
        />
      </div>
    </div>
    <div :class="$style.Info">
      Showing {{ filteredIndex.count }} of {{ total }} extensions
      <ElTag v-if="filter" closable @close="filter = ''"
        >Search: {{ filter }}</ElTag
      >
      <!-- browsing shows the curated index only; state the search rule
           exactly when it applies -->
      <span v-if="searching" :class="$style.SearchNote"
        >search includes unlisted extensions</span
      >
    </div>
    <!-- the featured box belongs to browsing the default index: it gives
         way to search results and to the other arrangements. it sits
         below the controls, so their position never depends on it -->
    <FeaturedExtension
      v-if="featured && !searching && arrange === defaultArrange"
      :ext="featured"
    />
    <div
      v-for="{ title, extensions, link, linkText, pageLink } in filteredIndex.index"
    >
      <h2 :class="$style.SectionHeading">
        {{ title
        }}<a
          v-if="pageLink"
          :href="pageLink"
          :class="$style.PageLink"
          :aria-label="`${title} category page`"
          ><IconLink :size="16"
        /></a>
      </h2>
      <DirectoryEntry
        v-for="ext in extensions"
        :key="ext.identifier"
        :ext="ext"
      />
      <span :class="$style.Link" v-if="link"
        ><a :href="link">{{ linkText }}</a></span
      >
    </div>
  </div>
</template>

<style module>
.Links {
  /* margin-top: -24px; */
  text-align: right;
}

@media (max-width: 768px) {
  .Links {
    margin-top: -16px;
  }
}

.Links a {
  text-decoration: none;
}

.Directory h2 {
  border: none;
  font-size: 1.2rem;
  margin: 0.5em 0 0.25em 0;
  padding: 0;
}

.Header {
  margin: 24px 0 16px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.Control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.Info {
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;

  font-size: 14px;
  text-align: left;
  color: var(--vp-c-text-2);
}

.Link {
  font-size: 14px;
}
.Link a {
  text-decoration: none;
}

/* sits at the right of the info row, under the search field */
.SearchNote {
  margin-left: auto;
}

/* link icon to a section's own page, revealed on heading hover (also on
   keyboard focus; touch users have the footers, info boxes and index) */
.PageLink {
  opacity: 0;
  margin-left: 8px;
  vertical-align: -2px;
  color: var(--vp-c-text-3);
  transition: opacity 0.15s;
  /* keep the icon on the heading's line (the svg is block by default) */
  display: inline-block;
}
.PageLink svg {
  display: block;
}
.SectionHeading:hover .PageLink,
.PageLink:focus-visible {
  opacity: 1;
}
.PageLink:hover {
  color: var(--vp-c-brand-1);
}

</style>
