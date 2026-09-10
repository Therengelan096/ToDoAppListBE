export const tagDecorator = (tag) => {
  if (!tag) return null;
  return {
    id: tag.id,
    name: tag.name,
    userId: tag.user_id,
    createdAt: tag.created_at
  };
};

export const tagsListDecorator = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => tagDecorator(tag));
};