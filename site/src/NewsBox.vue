<script setup lang="ts">
import { data } from "./data/news.data";
import { formatDate } from "./helpers/formatters";
</script>

<template>
  <div :class="$style.NewsBox">
    <div :class="$style.Header">
      <div :class="$style.Title"><b>Latest News</b></div>
      <div :class="$style.Link">
        <a href="https://forum.popclip.app/c/announce/9/none">More news</a>
      </div>
    </div>
    <ul>
      <li v-for="(item, index) in data.news.slice(0, 3)">
        <a :href="item.url" v-html="item.title"></a>
        <small>{{ formatDate(item.date) }}</small>
        <div :class="$style.Excerpt" v-if="index === 0 && item.excerpt">
          <span v-html="item.excerpt" /> <a :href="item.url">more</a>
        </div>
      </li>
    </ul>
  </div>
</template>

<style module>
div.NewsBox {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 16px;

  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 14px;
}
div.NewsBox ul {
  margin: 0;
}
div.NewsBox li {
  margin: 0;
}
div.Header {
  display: flex;
  justify-content: space-between;
  align-items: top;
}
div.Header div.Link {
  font-size: 0.9em;
}
div.Excerpt {
  font-size: 0.9em;
  line-height: 1.5em;
}
@media (max-width: 550px) {
  div.Excerpt {
    display: none;
  }
}
</style>
