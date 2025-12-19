import Layout from "@/components/layout";
import NavList from "@/components/NavList";
import NewsItem from "@/components/NewsItem";
import {
  getNewsCategories,
  getSearch,
  IBaseNewsItem,
  ICategory,
} from "@/libs/request";
import { getLang } from "@/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  List,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

import type { GetServerSidePropsContext } from "next/types";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const lang = getLang(context.req.headers["accept-language"]);

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
  context.res.setHeader("Content-Language", lang);
  const words = context.query.words as string;

  let page = (context.query?.page || 1) as number;
  if (isNaN(Number(page))) {
    page = 1;
  }
  const categories = await getNewsCategories(lang);

  let newsList = await getSearch({
    words,
    lang,
    page,
  });

  if (!Array.isArray(newsList)) {
    newsList = [];
  }

  let prevPage = null;
  let nextPage = null;

  if (page > 1) {
    prevPage = +page - 1;
  }

  nextPage = +page + 1;

  if (!newsList.length) {
    nextPage = null;
  }

  return {
    props: {
      categories,
      newsList,
      prevPage,
      nextPage,
      words,
    },
  };
};

interface Iprops {
  categories: ICategory[];
  newsList: IBaseNewsItem[];
  words: string;
  prevPage: number | null;
  nextPage: number | null;
}

export default function NewsListPage({
  categories,
  newsList,
  words,
  prevPage,
  nextPage,
}: Iprops) {
  const params = useSearchParams();

  const [disabled, setDisabled] = useState(false);

  const { register, handleSubmit } = useForm<{ words: string }>();

  const onSubmit = ({ words }: { words: string }) => {
    if (!words) {
      return null;
    }
    setDisabled(true);
    window.location.href = `/search?words=${words}`;
  };

  return (
    <Layout categories={categories}>
      <Stack spacing={6}>
        <Box w="full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputGroup>
              <Input
                type="search"
                defaultValue={params.get("words") || ""}
                disabled={disabled}
                rounded="sm"
                {...register("words")}
              />
              <InputRightAddon
                as={Button}
                isLoading={disabled}
                type="submit"
                rounded="sm"
              >
                <SearchIcon />
              </InputRightAddon>
            </InputGroup>
          </form>
        </Box>
        <Box as="section">
          {!!newsList.length && (
            <Stack
              as={List}
              divider={<StackDivider as="li" borderColor="rgba(0,0,0,0.1)" />}
              spacing="12px"
            >
              {newsList?.map((item) => (
                <NewsItem data={item} key={item.id} />
              ))}
            </Stack>
          )}
          {!newsList.length && (
            <Flex
              py={10}
              gap={4}
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
            >
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
              style={{ pointerEvents: prevPage ? "all" : "none" }}
              isDisabled={!prevPage}
              href={`/search?words=${words}&page=${prevPage}`}
              rounded="unset"
            >
              <ChevronLeftIcon w={8} h={8} />
            </Button>
            <Button
              as="a"
              flex={1}
              style={{ pointerEvents: nextPage ? "all" : "none" }}
              isDisabled={!nextPage}
              href={`/search?words=${words}&page=${nextPage}`}
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
