import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const ModuleTitle = ({ children }: PropsWithChildren) => {
  return (
    <Box
      as="h2"
      fontWeight={600}
      fontSize="xl"
      lineHeight={1.4}
      paddingBottom="6px"
      marginBottom="12px"
      position="relative"
      textTransform="uppercase"
      _after={{
        content: "''",
        display: "block",
        width: "50px",
        height: "5px",
        backgroundColor: "#222222",
        position: "absolute",
        left: 0,
        bottom: 0,
        borderRadius: "2px",
      }}
    >
      {children}
    </Box>
  );
};

export default ModuleTitle;
