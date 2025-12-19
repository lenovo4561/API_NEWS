
const fetcher = (url: string, lang: string) => {
  return fetch(`${process.env.BASE_URL}${url}`, {
    headers: {
      lang,
      country: process.env.COUNTRY,
      'site-name': process.env.SERVER_NAME.split('.')[0]
    },
  })
}

export interface ICategory {
  id: string;
  display_name: string;
  sort: number;
  icon: string;
  article_row: number;
}

export interface IBaseNewsItem {
  id: string;
  title: string;
  author: string;
  image: string;
  published_at: number;
  source_title: string;
  origin_url: string;
}

export interface INewsDetail extends IBaseNewsItem {
  content: string;
  summary: string;
  source_url: string;
}

export const getNewsCategories = async (lang: string): Promise<ICategory[]> => {
  const res = await fetcher('/api/news/resource', lang);
  const data = await res.json();
  return data.data.categories;
};

export const getHomeData = async (lang: string): Promise<
  Record<string, IBaseNewsItem[]>
> => {
  const res = await fetcher('/api/news/home?top_size=4', lang);
  const data = await res.json();
  return data.data;
};

export const getNewsList = async ({
  id,
  lang,
  page = 1,
}: {
  id: number | string;
  lang: string;
  page: number;
}): Promise<IBaseNewsItem[]> => {
  const res = await fetcher(
    `/api/news/list?category_id=${id}&page=${page}&page_size=10`,
    lang
  );
  const data = await res.json();
  return data.data;
};
export const getSearch = async ({
  words,
  lang,
  page = 1,
}: {
  words: string;
  lang: string;
  page: number;
}): Promise<IBaseNewsItem[]> => {
  const res = await fetcher(
    `/api/news/search?words=${words}&page=${page}&page_size=10`,
    lang
  );
  const data = await res.json();
  return data.data;
};

export const getNewsDetail = async (id:number | string, lang: string): Promise<{
  article: INewsDetail;
  next_article_id: string;
  last_article_id: string;
  source_name: 'aiNews' | 'bingNews'
}> => {
  const res = await fetcher(
    `/api/news/detail?article_id=${id}`,
    lang
  );
  const data = await res.json();
  return data.data;
};
