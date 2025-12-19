import dayjs from "dayjs";
import getConfig from "next/config";
import { memo } from "react";

import { Box, Stack, StackDivider, Text } from "@chakra-ui/react";

const {
  publicRuntimeConfig: { SERVER_NAME },
} = getConfig();

const Footer = () => {
  return (
    <Box as="footer" p={5} bgColor="#f5f5f5">
      <Stack
        direction="row"
        divider={<StackDivider borderColor="rgba(0,0,0,0.1)" />}
        justifyContent="center"
      >
        <Text
          as="a"
          color="#666"
          lineHeight={1}
          fontSize="xs"
          href="/privacy-policy"
        >
          PRIVACY
        </Text>
        <Text as="a" color="#666" lineHeight={1} fontSize="xs" href="/terms">
          TERMS OF USE
        </Text>
      </Stack>
      <Text
        color="#999"
        lineHeight="normal"
        textAlign="center"
        mt="6px"
        fontSize="xs"
      >
        Copyright©{dayjs().get("year")} {SERVER_NAME} All rights Reserved.
      </Text>
    </Box>
  );
};

export default memo(Footer);
