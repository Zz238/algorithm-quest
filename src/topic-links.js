import { ALGORITHM_TOPIC_BY_ID, ROADMAP_ITEMS, roadmapItemRoute } from './data/algorithm-roadmap.js';
import { findLesson, JAVA_INDEX, lessonRoute } from './data/course-index.js';
export function topicPrerequisite(id) {
  const lesson = findLesson(id);
  if (lesson) return { title: lesson.title, path: lessonRoute(id) };
  if (JAVA_INDEX[id]) return { title: JAVA_INDEX[id].title, path: '/java/' + id.slice(5) };
  const topic = ALGORITHM_TOPIC_BY_ID[id] || ROADMAP_ITEMS.find((t) => t.id === id);
  return topic ? { title: topic.title, path: roadmapItemRoute(topic) } : null;
}
