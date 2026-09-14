import { categoryDecorator } from "./category.decorator.js";
import { tagsListDecorator } from "./tag.decorator.js";

export const taskDecorator = (task, category = null, tags = []) => {
  if (!task) return null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    userId: task.user_id,
    createdAt: task.created_at,
    category: category ? categoryDecorator(category) : null,
    tags: tagsListDecorator(tags),
  };
};