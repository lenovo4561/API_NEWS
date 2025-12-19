import { useEffect, useState } from "react";
import { useWindowScroll, useWindowSize } from "react-use";

import { Flex, Icon } from "@chakra-ui/react";

const BackTop = () => {
  const [isShow, setIsShow] = useState(false);
  const { y } = useWindowScroll();
  const { height } = useWindowSize();

  useEffect(() => {
    if (y > height) {
      setIsShow(true);
    } else {
      setIsShow(false);
    }
  }, [y, height]);

  return (
    <Flex
      display={isShow ? "flex" : "none"}
      position="fixed"
      right={4}
      bottom="60px"
      rounded="full"
      aria-label="Back Top"
      width="50px"
      height="50px"
      backgroundColor="rgba(0, 0, 0, 0.8)"
      color="#ffffff"
      justifyContent="center"
      alignItems="center"
      zIndex={98}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
    >
      <Icon viewBox="0 0 1024 1024" w="30px" h="30px">
        <path
          fill="currentColor"
          d="M127.936 191.936h768v-64h-768v64z m88.192 462.72l263.04-258.176v553.536h64.64V396.16l267.52 260.928 45.76-44.8-323.648-315.648a32 32 0 0 0-44.8 0.832c-76.16 74.88-318.336 312.512-318.336 312.512l45.824 44.672z"
        />
      </Icon>
    </Flex>
  );
};

export default BackTop;
