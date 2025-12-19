import { extendTheme } from "@chakra-ui/react";
import { withProse } from '@nikolovlazar/chakra-ui-prose'
const theme = extendTheme({
  styles: {
    global: {
      body: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "#222222",
        scrollBehavior: "smooth",
      },
      ".rts___tabs": {
        padding: 0
      },
      ".rts___tab___selected": {
        backgroundColor: '#108ee9'
      },
      ".rts___tabs___container": {
        padding: "0 8px 8px",
      },
      ".article": {
        fontFamily: "PingFangSC-Medium,PingFang SC",
        fontSize: "16px",
        fontWeight: 500,
        color: "#666",
        lineHeight: 1.7,
        marginBottom: "10px",
        width: "100%",
        "& p": {
          fontFamily: "PingFangSC-Medium,PingFang SC",
          fontSize: "16px",
          fontWeight: 500,
          color: "#666",
          lineHeight: 1.7,
          marginBottom: "10px",
          width: "100%",
        },
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    body: "-apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial, noto sans, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji",
  },
}, withProse());

export default theme;
