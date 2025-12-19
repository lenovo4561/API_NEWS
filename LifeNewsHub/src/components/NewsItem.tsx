import dynamic from 'next/dynamic';
import { memo } from 'react';

import { IBaseNewsItem } from '@/libs/request';
import { Box, Flex, Heading, ListItem } from '@chakra-ui/react';

import LazyLoadImage from './LazyLoadImage';

interface IProps {
  type?: "horizontal" | "vertical" | "picture" | "item";
  data: IBaseNewsItem;
}

const FormatDate = dynamic(() => import("@/components/FormatDate"), {
  ssr: false,
});

const NormalItem = ({ data }: { data: IBaseNewsItem }) => {
  const { id, title, author, image, published_at, source_title } = data;
  return (
    <ListItem>
      <Flex gap={4} as="a" href={`/news/${id}`}>
        <Flex flexDirection="column" gap="4px" flex={1}>
          <Heading
            as="p"
            fontWeight={500}
            fontSize="xs"
            noOfLines={2}
            lineHeight="1.4em"
          >
            {title}
          </Heading>
          <Flex gap="1em" fontSize="2xs" lineHeight="normal" color="#999999">
            {!!author && <Box as="span">By {author}</Box>}
            <FormatDate date={published_at} />
          </Flex>
          <Flex gap="1em" fontSize="2xs" lineHeight="normal" color="#999999">
            {!!source_title && <Box as="span">From {source_title}</Box>}
          </Flex>
        </Flex>
        <LazyLoadImage
          alignSelf="flex-start"
          flex="0 0 124px"
          ratio={124 / 70}
          alt={title}
          src={image}
        />
      </Flex>
    </ListItem>
  );
};

const VerticalItem = ({ data }: { data: any }) => {
  const { id, title, author, image, published_at } = data;
  return (
    <ListItem>
      <Flex gap={4} as="a" href={`/news/${id}`} flexDirection="column">
        <LazyLoadImage ratio={100 / 54} alt={title} src={image} />
        <Flex flexDirection="column" gap="10px" flex={1}>
          <Heading
            as="p"
            fontWeight={500}
            fontSize="md"
            noOfLines={2}
            lineHeight="1.4em"
          >
            {title}
          </Heading>
          <Flex gap="1em" fontSize="xs" lineHeight="normal" color="#999999">
            {!!author && <Box as="span">By {author}</Box>}
            <FormatDate date={published_at} />
          </Flex>
        </Flex>
      </Flex>
    </ListItem>
  );
};

const PictureItem = ({ data }: { data: IBaseNewsItem }) => {
  const { id, image, title } = data;
  return (
    <ListItem position="relative">
      <Box as="a" href={`/news/${id}`}>
        <LazyLoadImage ratio={100 / 54} alt={title} src={image} />
        <Box
          bg="linear-gradient(to top,rgba(0,0,0,0.9),rgba(0,0,0,0))"
          position="absolute"
          left={0}
          bottom={0}
          height="76px"
          width="full"
        ></Box>
        <Heading
          as="p"
          noOfLines={1}
          fontWeight={500}
          fontSize="md"
          lineHeight="normal"
          width="full"
          px={4}
          position="absolute"
          bottom={4}
          left={0}
          color="#ffffff"
        >
          {title}
        </Heading>
      </Box>
    </ListItem>
  );
};

const TextItem = ({ data }: { data: IBaseNewsItem }) => {
  const { id, title } = data;
  return (
    <ListItem py={2}>
      <Box as="a" href={`/news/${id}`}>
        <Heading
          as="p"
          fontWeight={500}
          fontSize="md"
          lineHeight={1.4}
          height="2.8em"
          noOfLines={2}
          position="relative"
          pl={4}
          _before={{
            content: "''",
            position: "absolute",
            left: 0,
            top: "8.2px",
            w: "6px",
            h: "6px",
            backgroundColor: "#222",
          }}
        >
          {title}
        </Heading>
      </Box>
    </ListItem>
  );
};

const NewsItem = ({ data, type }: IProps) => {
  switch (type) {
    case "picture":
      return <PictureItem data={data} />;
    case "item":
      return <TextItem data={data} />;
    case "vertical":
      return <VerticalItem data={data} />;
    default:
      return <NormalItem data={data} />;
  }
};

export default memo(NewsItem);
