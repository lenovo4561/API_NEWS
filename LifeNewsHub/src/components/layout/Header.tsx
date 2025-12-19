import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { ICategory } from "@/libs/request";
import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  Show,
  useOutsideClick,
} from "@chakra-ui/react";

import Categories from "./Categories";

const Header = ({
  categories,
  categoryData,
}: {
  categories: ICategory[];
  categoryData?: ICategory;
}) => {
  const pathname = usePathname();
  const params = useSearchParams();
  const [isShow, setIsShow] = useState(false);
  const formRef = useRef(null);

  const [disabled, setDisabled] = useState(false);

  useOutsideClick({
    ref: formRef,
    handler: () => setIsShow(false),
  });

  const { register, handleSubmit } = useForm<{ words: string }>();

  const onSubmit = ({ words }: { words: string }) => {
    if (!words || !words.trim()) {
      return null;
    }
    setDisabled(true);
    window.location.href = `/search?words=${words}`;
  };

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={99}
      backdropFilter="blur(4px)"
      boxShadow="base"
    >
      <Flex
        as="header"
        px="16px"
        h="60px"
        alignItems="center"
        justifyContent="space-between"
        gap={6}
        position="relative"
      >
        {/* <MenuToggle toggle={onToggle} /> */}
        <Heading as="h1" fontSize="xl" flex={{ base: "unset", md: 1 }}>
          <Link href="/">Life News Hub</Link>
        </Heading>
        {pathname !== "/search" ? (
          <>
            <Box w="full" maxW="320px" display={{ base: "none", md: "block" }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <InputGroup size="sm">
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
            <IconButton
              px={3}
              aria-label="search button"
              icon={<SearchIcon />}
              size="sm"
              rounded="sm"
              display={{ base: "block", md: "none" }}
              onClick={() => {
                setIsShow(true);
              }}
            />
          </>
        ) : (
          <div />
        )}
      </Flex>
      <Show below="md">
        <Flex
          px={4}
          display={{ base: isShow ? "flex" : "none", md: "none" }}
          justifyContent="center"
          alignItems="center"
          position="absolute"
          width="100%"
          top={0}
          bottom={0}
          height="60px"
          bgColor="rgba(255, 255, 255, 1)"
        >
          <Box w="full" ref={formRef}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputGroup size="sm">
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
        </Flex>
      </Show>
      <Categories
        categories={categories}
        category={categoryData?.display_name}
      />
    </Box>
  );
};

export default Header;
