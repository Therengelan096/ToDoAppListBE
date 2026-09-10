export const categoryDecorator = (category) => {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    userId: category.user_id,
    createdAt: category.created_at
  };
};

export const categoriesListDecorator = (categories) => {
  if (!Array.isArray(categories)) return [];
  return categories.map((category) => categoryDecorator(category));
};