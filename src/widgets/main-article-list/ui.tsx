import { ReactNode, useEffect } from 'react';
import { useUnit } from 'effector-react';
import { Link } from 'react-router-dom';
import { FavoriteArticle, UnfavoriteArticle } from '~features/article';
import { PATH_PAGE } from '~shared/lib/react-router';
import { Button } from '~shared/ui/button';
import { ErrorHandler } from '~shared/ui/error-handler';
import { MainArticleListModel } from './model';

type MainArticleListProps = {
  $$model: MainArticleListModel;
};

export function MainArticleList(props: MainArticleListProps) {
  const { $$model } = props;

  const [
    articles,
    pendingInitial,
    error,
    emptyData,
    canFetchMore,
    pendingNextPage,
  ] = useUnit([
    $$model.$articles,
    $$model.$pendingInitial,
    $$model.$error,
    $$model.$emptyData,
    $$model.$canFetchMore,
    $$model.$pendingNextPage,
  ]);

  const loadMore = useUnit($$model.$$pagination.nextPage);
  const unmounted = useUnit($$model.unmounted);

  useEffect(() => unmounted, [unmounted]);

  return (
    <>
      {pendingInitial && <ArticleWrapper>Loading articles...</ArticleWrapper>}

      {error && (
        <ArticleWrapper>
          <ErrorHandler error={error as any} />
        </ArticleWrapper>
      )}

      {emptyData && (
        <ArticleWrapper>No articles are here... yet.</ArticleWrapper>
      )}

      {articles &&
        articles.map((article) => {
          const {
            author: { username, image },
            title,
            description,
            slug,
            createdAt,
            favorited,
          } = article;

          return (
            <div key={slug} className="article-preview">
              <div className="article-meta">
                <Link to={PATH_PAGE.profile.root(username)}>
                  <img src={image} alt={username} />
                </Link>
                <div className="info">
                  <Link
                    to={PATH_PAGE.profile.root(username)}
                    className="author"
                  >
                    {username}
                  </Link>
                  <span className="date">{createdAt}</span>
                </div>
                {favorited ? (
                  <UnfavoriteArticle
                    $$model={$$model.$$unfavoriteArticle}
                    article={article}
                  />
                ) : (
                  <FavoriteArticle
                    $$model={$$model.$$favoriteArticle}
                    article={article}
                  />
                )}
              </div>
              <Link to={PATH_PAGE.article.slug(slug)} className="preview-link">
                <h1>{title}</h1>
                <p>{description}</p>
                <span>Read more...</span>
              </Link>
            </div>
          );
        })}

      {canFetchMore && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            color="primary"
            variant="outline"
            onClick={loadMore}
            disabled={pendingNextPage}
          >
            {pendingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        </div>
      )}
    </>
  );
}

type ArticleWrapperProps = {
  children: ReactNode;
};

function ArticleWrapper(props: ArticleWrapperProps) {
  const { children } = props;

  return <div className="article-preview">{children}</div>;
}
