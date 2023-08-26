import { defineLoader } from "vitepress";
import { z } from "zod";
import axios from "axios";

const ZTopic = z.object({
    id: z.number(),
    title: z.string(),
    fancy_title: z.string(),
    created_at: z.coerce.date(),
    slug: z.string(),
    excerpt: z.string().nullish(),
    category_id: z.number(),
  });
const ZTopicsRaw = z.object({
  topic_list: z.object({
    topics: z.array(ZTopic),
  }),
});
const ZNewsItem = z.object({
  url: z.string().url(),
  title: z.string(),
  date: z.string(),
  excerpt: z.string().nullish(),
});

type Topic = z.infer<typeof ZTopic>;
type TopicsRaw = z.infer<typeof ZTopicsRaw>;
type NewsItem = z.infer<typeof ZNewsItem>;

interface NewsData {
  news: NewsItem[];
}

function processTopics(topics: Topic[]): NewsItem[] {
  return topics.filter((topic) => {
    return topic.id !== 91; // exclude the "About The Announcements category" topic
  }).map((topic) => ({
    url: `https://forum.popclip.app/t/${topic.slug}/${topic.id}`,
    title: topic.title,
    date: topic.created_at.toISOString(),
    excerpt: topic.excerpt,
  }));
}

declare const data: NewsData;
export { data };
export default defineLoader({
  async load(): Promise<NewsData> {
    const { data } = await axios.get(
      "https://forum.popclip.app/c/announce/9/none.json",
    );
    const parsed = ZTopicsRaw.parse(data);
    return {
      news: processTopics(parsed.topic_list.topics),
    };
  },
});
