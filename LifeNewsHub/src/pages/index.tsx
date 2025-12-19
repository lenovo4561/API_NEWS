import Layout from '@/components/layout';
import ModuleTitle from '@/components/ModuleTitle';
import NewsItem from '@/components/NewsItem';
import { getHomeData, getNewsCategories, IBaseNewsItem, ICategory } from '@/libs/request';
import { getLang } from '@/utils';
import { Box, Flex, List, Stack, StackDivider } from '@chakra-ui/react';

import type { GetServerSidePropsContext } from "next/types";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const lang = getLang(context.req?.headers['accept-language'])

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  context.res.setHeader(
    "Content-Language",
    lang
  );
  const [categories, homeData] = await Promise.all([
    getNewsCategories(lang),
    getHomeData(lang),
  ]);
  return {
    props: {
      categories,
      homeData,
    },
  };
};

interface Iprops {
  categories: ICategory[];
  homeData: Record<string, IBaseNewsItem[]>;
}

export default function Home({ categories, homeData }: Iprops) {
  const { top = [], middle = [], bottom = [] } = homeData;
  return (
    <Layout categories={categories}>
      <Stack spacing={6}>
        <Box as="section">
          <ModuleTitle>CAROUSEL POSTS</ModuleTitle>
          <Stack
            as={List}
            spacing="12px"
            divider={<StackDivider as="li" borderColor="rgba(0,0,0,0.1)" />}
          >
            {top.map((item) => (
              <NewsItem data={item} key={item.title} />
            ))}
          </Stack>
        </Box>
        <Box as="section">
          <ModuleTitle>FEATURED POSTS</ModuleTitle>
          <Stack as={List} spacing="12px">
            {middle.slice(0, 2).map((item) => (
              <NewsItem type="picture" data={item} key={item.id} />
            ))}
          </Stack>
          <Stack
            as={List}
            divider={<StackDivider as="li" borderColor="rgba(0,0,0,0.1)" />}
            spacing="12px"
            pt={4}
          >
            {middle.slice(2).map((item) => (
              <NewsItem type="item" data={item} key={item.id} />
            ))}
          </Stack>
        </Box>
        <Box as="section">
          <ModuleTitle>MOST POPLAR</ModuleTitle>
          <Stack
            as={List}
            spacing="12px"
            divider={<StackDivider as="li" borderColor="rgba(0,0,0,0.1)" />}
          >
            {bottom.map((item) => (
              <NewsItem data={item} key={item.id} />
            ))}
          </Stack>
        </Box>
        <Flex
          as="a"
          href={`/${categories[0].display_name}`}
          bgColor="#222222"
          fontSize="md"
          fontWeight={400}
          rounded="4px"
          color="#ffffff"
          justifyContent="center"
          h="40px"
          alignItems="center"
        >
          See more
        </Flex>
      </Stack>
    </Layout>
  );
}
