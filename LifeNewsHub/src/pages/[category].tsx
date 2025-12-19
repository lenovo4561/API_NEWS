import Layout from '@/components/layout';
import ModuleTitle from '@/components/ModuleTitle';
import NavList from '@/components/NavList';
import NewsItem from '@/components/NewsItem';
import { getNewsCategories, getNewsList, IBaseNewsItem, ICategory } from '@/libs/request';
import { getLang } from '@/utils';
import { ChevronLeftIcon, ChevronRightIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Flex, List, Stack, StackDivider, Text } from '@chakra-ui/react';

import type { GetServerSidePropsContext } from "next/types";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const lang = getLang(context.req.headers['accept-language'])

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  context.res.setHeader(
    "Content-Language",
    lang
  );
  const category = context.query.category as string;
  let page = (context.query?.page || 1) as number;
  if (isNaN(Number(page))) {
    page = 1;
  }
  const categories = await getNewsCategories(lang);
  const categoryData = categories.find(
    (item) => item.display_name === category
  );


  if (!categoryData) {
    return {
      notFound: true,
    };
  }
  let newsList = await getNewsList({
    id: categoryData.id,
    lang,
    page,
  });

  if (!Array.isArray(newsList)) {
    newsList = []
    // return {
    //   notFound: true,
    // };
  }

  let prevPage = null;
  let nextPage = null;

  if (page > 1) {
    prevPage = +page - 1;
  }

  if (Math.floor(categoryData.article_row / 10) > page) {
    nextPage = +page + 1;
  }

  if (!newsList.length) {
    nextPage = null;
  }

  return {
    props: {
      categories,
      newsList,
      categoryData,
      prevPage,
      nextPage,
    },
  };
};

interface Iprops {
  categories: ICategory[];
  newsList: IBaseNewsItem[];
  categoryData: ICategory;
  prevPage: number | null;
  nextPage: number | null;
}

export default function NewsListPage({
  categories,
  newsList,
  categoryData,
  prevPage,
  nextPage,
}: Iprops) {
  return (
    <Layout categories={categories} categoryData={categoryData}>
      <Stack spacing={6}>
        <Box as="section">
          <ModuleTitle>{categoryData.display_name}</ModuleTitle>
          {!!newsList.length && <Stack
            as={List}
            divider={<StackDivider as="li" borderColor="rgba(0,0,0,0.1)" />}
            spacing="12px"
          > 
            {newsList?.slice(0, 1).map((item) => (
              <NewsItem type="vertical" data={item} key={item.id} />
            ))}
            {newsList?.slice(1).map((item) => (
              <NewsItem data={item} key={item.id} />
            ))}
          </Stack>
          }
          {!newsList.length && (
            <Flex py={10} gap={4} justifyContent='center' alignItems='center' flexDirection="column">
              <Text>No Records</Text>
              <WarningTwoIcon w={8} h={8} />
            </Flex>
          )}
        </Box>
        {(!!prevPage || !!nextPage) && (
          <ButtonGroup
            variant="outline"
            colorScheme="blackAlpha"
            size="md"
            spacing={20}
          >
            <Button
              flex={1}
              as="a"
              style={{ pointerEvents: prevPage ? 'all' : 'none' }}
              isDisabled={!prevPage}
              href={`/${categoryData.display_name}?page=${prevPage}`}
              rounded="unset"
            >
              <ChevronLeftIcon w={8} h={8} />
            </Button>
            <Button
              as="a"
              flex={1}
              style={{ pointerEvents: nextPage ? 'all' : 'none' }}
              isDisabled={!nextPage}
              href={`/${categoryData.display_name}?page=${nextPage}`}
              rounded="unset"
            >
              <ChevronRightIcon w={8} h={8} />
            </Button>
          </ButtonGroup>
        )}
        <NavList categories={categories} />
      </Stack>
    </Layout>
  );
}
