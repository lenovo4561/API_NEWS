import { Fragment, useEffect, useRef, useState } from "react";

import AdsTemplate from "@/components/AdsTemplate";
import FormatDate from "@/components/FormatDate";
import Layout from "@/components/layout";
import LazyLoadImage from "@/components/LazyLoadImage";
import NavList from "@/components/NavList";
import {
  getNewsCategories,
  getNewsDetail,
  ICategory,
  INewsDetail,
} from "@/libs/request";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Heading,
  Stack,
} from "@chakra-ui/react";

import HTMLReactParser from "html-react-parser";

import type { GetServerSidePropsContext } from "next/types";
import { useWindowScroll } from "react-use";
import { useInView } from "framer-motion";
import { getLang } from "@/utils";

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
  const id = context.query.id as string;
  const detail = await getNewsDetail(id, lang);

  if (!detail?.article?.id) {
    return {
      notFound: true,
    };
  }

  const categories = await getNewsCategories(lang);

  return {
    props: {
      categories,
      detail,
    },
  };
};

interface Iprops {
  categories: ICategory[];
  detail: {
    article: INewsDetail;
    next_article_id: string;
    last_article_id: string;
    source_name: "aiNews" | "bingNews";
  };
}

export default function NewsDetail({ categories, detail }: Iprops) {
  // const newsBottomRef = useRef<HTMLDivElement>(null);
  // const newsBottomInVew = useInView(newsBottomRef, { once: true });
  // const { y } = useWindowScroll();
  // const [dest, setDest] = useState();

  // useEffect(() => {
  //   if (newsBottomInVew && newsBottomRef.current) {
  //     const adsNode = window.document.createElement("ins");
  //     adsNode.className = "adsbygoogle";
  //     adsNode.style.display = "block";
  //     adsNode.setAttribute("data-ad-client", "ca-pub-9543177256867205");
  //     adsNode.setAttribute("data-ad-slot", "7190194840");
  //     adsNode.setAttribute("data-ad-format", "auto");
  //     adsNode.setAttribute("data-full-width-responsive", "true");
  //     newsBottomRef.current.parentNode?.insertBefore(
  //       adsNode,
  //       newsBottomRef.current
  //     );
  //     // @ts-ignore
  //     (window.adsbygoogle = window.adsbygoogle || []).push({});
  //   }
  // }, [newsBottomInVew]);

  // useEffect(() => {
  //   const article = document.getElementById("article");
  //   if (
  //     y &&
  //     dest &&
  //     y >= dest &&
  //     article &&
  //     !article.getElementsByTagName("ins").length
  //   ) {
  //     const inArticle = document.getElementById("in-article");
  //     const adsNode = window.document.createElement("ins");
  //     adsNode.className = "adsbygoogle";
  //     adsNode.style.display = "block";
  //     adsNode.style.textAlign = "center";
  //     adsNode.setAttribute("data-ad-layout", "in-article");
  //     adsNode.setAttribute("data-ad-format", "fluid");
  //     adsNode.setAttribute("data-ad-client", "ca-pub-9543177256867205");
  //     adsNode.setAttribute("data-ad-slot", "8052792324");
  //     article.insertBefore(adsNode, inArticle);
  //     // @ts-ignore
  //     (window.adsbygoogle = window.adsbygoogle || []).push({});
  //   }
  // }, [y, dest]);

  // useEffect(() => {
  //   const clientHeight = window.document.body.clientHeight;
  //   const innerHeight = window.innerHeight;
  //   const article = document.getElementById("article");
  //   if (article) {
  //     const articleClientHeight = article.clientHeight;
  //     if (Math.floor(articleClientHeight / innerHeight) > 1) {
  //       const center = Math.ceil(clientHeight / 2);
  //       const childNodes = article.childNodes;
  //       for (let i = 0; i < childNodes.length; i++) {
  //         const node = childNodes[i];
  //         if (node.nodeType === 1) {
  //           // @ts-ignore
  //           if (node.offsetTop >= center) {
  //             // @ts-ignore
  //             setDest(node.offsetTop - innerHeight);
  //             // @ts-ignore
  //             node.setAttribute("id", "in-article");
  //             break;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }, []);

  const { article, next_article_id, last_article_id, source_name } = detail;

  function generateArticle(content: string) {
    const paragraph = content.split("\n");
    return paragraph.map((item, index) => <p key={index}>{item}</p>);
  }

  return (
    <Layout categories={categories}>
      <Stack spacing={6}>
        <Box as="section">
          <Heading as="h1" fontSize="24px" color="#1e2428">
            {article.title}
          </Heading>
          <Box my="10px">
            {/* yoursmart-newstop-display */}
            {/* <AdsTemplate
              className="adsbygoogle"
              style={{ display: "block" }}
              data-ad-client="ca-pub-9543177256867205"
              data-ad-slot="4895203990"
              data-ad-format="auto"
              data-full-width-responsive="true"
            /> */}
          </Box>
          <Flex gap="1em" fontSize="xs" lineHeight="normal" color="#999999">
            {!!article.author && <Box as="span">By {article.author}</Box>}
            <FormatDate date={article.published_at} />
          </Flex>
          <Flex gap="1em" fontSize="xs" lineHeight="normal" color="#999999" mt={2}>
            {!!article.source_title && <Box as="span">From {article.source_title}</Box>}
          </Flex>
          <Divider borderColor="rgba(0,0,0,.1)" my={4} />
          <Box as="article" className="article" id="article">
            <LazyLoadImage
              ratio={100 / 53}
              alt={article.title}
              src={article.image}
              mb="10px"
            />
            {["aiNews"].includes(source_name) &&
              generateArticle(article.content)}
            {["bingNews"].includes(source_name) &&
              HTMLReactParser(article.content)}
          </Box>
          {/* <Box ref={newsBottomRef}></Box> */}
        </Box>
        <ButtonGroup
          variant="outline"
          colorScheme="blackAlpha"
          size="md"
          spacing={10}
          isDisabled
        >
          <Button
            flex={1}
            as="a"
            style={{ pointerEvents: !last_article_id || last_article_id === "0" ? 'none' : 'all' }}
            isDisabled={!last_article_id || last_article_id === "0"}
            href={`/news/${last_article_id}`}
            rounded="unset"
          >
            <ChevronLeftIcon w={6} h={6} />
            Previous article
          </Button>
          <Button
            as="a"
            flex={1}
            isDisabled={!next_article_id || next_article_id === "0"}
            style={{ pointerEvents: !next_article_id || next_article_id === "0" ? 'none' : 'all' }}
            href={`/news/${next_article_id}`}
            rounded="unset"
          >
            Next article
            <ChevronRightIcon w={6} h={6} />
          </Button>
        </ButtonGroup>
        <NavList categories={categories} />
      </Stack>
    </Layout>
  );
}
