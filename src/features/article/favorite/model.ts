import { createMutation } from '@farfetched/core';
import { createEvent, restore, sample } from 'effector';
import { Article, articleApi } from '~entities/article';

export type FavoriteArticleModel = ReturnType<typeof createModel>;

export function createModel() {
  const favorite = createEvent<Article>();
  const optimisticallyUpdate = createEvent<Article>();

  const favoriteArticleMutation = createMutation({
    handler: articleApi.createArticleFavoriteFx,
    name: 'favoriteArticleMutation',
  });

  const $article = restore(favorite, null);
  const $slug = $article.map((article) => article?.slug);

  sample({
    clock: favorite,
    source: $slug,
    filter: Boolean,
    fn: (slug) => ({ slug }),
    target: favoriteArticleMutation.start,
  });

  sample({
    clock: favoriteArticleMutation.start,
    source: $article,
    filter: Boolean,
    fn: (article) => ({
      ...article,
      favorited: true,
      favoritesCount: article.favoritesCount + 1,
    }),
    target: optimisticallyUpdate,
  });

  return {
    favoriteArticleMutation,
    optimisticallyUpdate,
    favorite,
  };
}
