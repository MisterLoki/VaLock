import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#1D4044",
      }
    },
  },
  fonts: {
    // Add custom fonts
    heading: "Arial, sans-serif",
    body: "Roboto, sans-serif",
  },
  components: {
    Flex: {
        baseStyle: {
            bg: "#1D4044"
        },
    },
  }
});

export default theme;