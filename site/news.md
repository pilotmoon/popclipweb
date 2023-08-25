---
titleTemplate: false
---
<script setup lang="ts">
import { data } from './news.data';
import { formatDate } from './components/helpers/formatters'
</script>

# PopClip News

<ul>
  <li v-for="item in data.news">
    <a :href="item.url">{{ item.title }}</a> <small>{{ formatDate(item.date) }}</small>
  </li>
</ul>
