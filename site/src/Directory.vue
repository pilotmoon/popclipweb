<script setup lang="ts">
import type { ExtInfo } from "./data/extensionInfo";
import { data as exts } from "./data/extensions.data";
import { data as categoryDefs, type Section } from "./data/directory.data";
import { IconSearch } from "@tabler/icons-vue";
import DirectoryEntry from "./DirectoryEntry.vue";
import {
  ElCheckbox,
  ElInput,
  ElRadioButton,
  ElRadioGroup,
  ElTag,
} from "element-plus";
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useData } from "vitepress";
import { useDebounceFn } from "@vueuse/core";

// filter/arrange state
const defaultFilter = "";
const filter = ref(defaultFilter);
const defaultArrange = "categories";
const arrange = ref(defaultArrange);
// off by default: the directory shows the curated index; the toggle
// expands every arrangement to include unlisted extensions too
const showUnlisted = ref(false);

// searching always covers everything: search intent is "does it exist?",
// and a search that misses a published extension reads as "no". the
// curation signal survives in the results via the Unlisted tag and, in
// the categories arrangement, the trailing Unlisted Extensions section.
const searching = computed(() => filter.value !== defaultFilter);
const effectiveShowUnlisted = computed(
  () => showUnlisted.value || searching.value,
);

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

// the extensions currently on display
const extsMap = computed(
  () =>
    new Map(
      [...allMap].filter(([, e]) => effectiveShowUnlisted.value || !e.unlisted),
    ),
);

// define the arrangements
const alphaSection = computed<Section>(() => ({
  title: "All Extensions (Alphabetical)",
  members: [...extsMap.value.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => e.identifier),
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
// within a section: flagships first, then the rest, each group A-Z
function sectionOrder(list: ExtInfo[]): string[] {
  return list
    .sort(
      (a, b) =>
        (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0) ||
        a.name.localeCompare(b.name),
    )
    .map((e) => e.identifier);
}

const categoriesIndex = computed<Section[]>(() => {
  // 5 newset extensions
  const newTitle = "Newly Added";
  const newest = {
    title: newTitle,
    members: newestSection.value.members.slice(0, 5),
    link: "#a=newest",
    special: true,
  };
  // group the listed extensions by category slug. an unlisted extension
  // may carry a category (staged for when it is listed), but while
  // unlisted it belongs only to the section of its own below
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
      sections.push({ title: def.title, members: sectionOrder(members) });
      bySlug.delete(def.slug);
    }
  }
  // always-visible tail section: anything listed but not claimed by a
  // category above (no category, or a slug that no longer exists) --
  // this is where curation gaps show themselves
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
  // when shown, the unlisted extensions form their own final section,
  // kept apart from Not Categorized (which tracks curation gaps)
  const unlisted = [...extsMap.value.values()].filter((e) => e.unlisted);
  if (unlisted.length) {
    sections.push({
      title: "Unlisted Extensions",
      members: sectionOrder(unlisted),
    });
  }
  return [newest, ...sections];
});
const arrangements = computed(
  () =>
    new Map([
      ["categories", { label: "Categories", index: categoriesIndex.value }],
      ["alpha", { label: "A–Z", index: [alphaSection.value] }],
      ["newest", { label: "New", index: [newestSection.value] }],
      ["updated", { label: "Updated", index: [updatedSection.value] }],
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
  showUnlisted.value = params.get("u") === "1";
}

// watch filter/arrange change
watch([filter, arrange, showUnlisted], ([newFilter, newArrange, newShow]) => {
  const params = new URLSearchParams();
  if (newArrange !== defaultArrange) {
    params.set("a", newArrange);
  }
  if (newFilter !== defaultFilter) {
    params.set("q", newFilter);
  }
  if (newShow) {
    params.set("u", "1");
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
    extensions: ExtInfo[];
  }[] = [];
  const all = new Set<string>(arrangements.value.get("alpha")?.index[0].members);
  const filterValue = filter.value.toLowerCase();
  for (const section of selectedIndex.value) {
    if (filterValue && section.special) {
      continue;
    }
    const extensions: ExtInfo[] = [];
    for (const identifier of section.members) {
      const ext = extsMap.value.get(identifier);
      if (ext?.filterTerms?.includes(filterValue)) {
        extensions.push(ext);
        uniques.add(identifier);
      }
      all.delete(identifier);
    }
    if (extensions.length > 0) {
      index.push({
        title: section.title,
        link: section.link,
        linkText: `View all in "${section.title}" →`,
        extensions,
      });
    }
  }
  // if user has typed a search filter, add any remaining extensions in extras section
  if (filterValue && all.size > 0) {
    const extensions: ExtInfo[] = [];
    for (const identifier of all) {
      const ext = extsMap.value.get(identifier);
      if (ext?.filterTerms?.includes(filterValue)) {
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
        <ElRadioGroup v-model="arrange">
          <ElRadioButton label="categories">Categories</ElRadioButton>
          <ElRadioButton label="alpha">A–Z</ElRadioButton>
          <ElRadioButton label="newest">New</ElRadioButton>
          <ElRadioButton label="updated">Updated</ElRadioButton>
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
      <!-- while searching, scope is forced to everything and the checkbox
           would be a dead control: swap it for the rule itself -->
      <span :class="$style.ShowUnlisted">
        <template v-if="searching">search includes unlisted extensions</template>
        <ElCheckbox v-else v-model="showUnlisted" size="small"
          >Show unlisted extensions</ElCheckbox
        >
      </span>
    </div>
    <div v-for="{ title, extensions, link, linkText } in filteredIndex.index">
      <h2>{{ title }}</h2>
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

/* sits at the right of the info row, under the filter field */
.ShowUnlisted {
  margin-left: auto;
}
</style>
