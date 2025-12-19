import { memo } from "react";

import { ICategory } from "@/libs/request";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";

import ModuleTitle from "./ModuleTitle";

const NavItem = ({ display_name, article_row }: ICategory) => {
  return (
    <Flex
      as="a"
      href={`/${display_name}`}
      justifyContent="space-between"
      px={4}
      h={10}
      bgColor="#f5f5f5"
      alignItems="center"
      rounded="base"
    >
      <Heading
        as="h4"
        lineHeight="normal"
        fontSize="md"
        textTransform="uppercase"
      >
        {display_name}
      </Heading>
      <Text>{article_row}</Text>
    </Flex>
  );
};

const NavList = ({ categories }: { categories: ICategory[] }) => {
  return (
    <Box as="section">
      <ModuleTitle>POPULAR CATEGORY</ModuleTitle>
      <Stack spacing="12px">
        {categories.map((category) => (
          <NavItem {...category} key={category.id} />
        ))}
      </Stack>
    </Box>
  );
};

export default memo(NavList);
