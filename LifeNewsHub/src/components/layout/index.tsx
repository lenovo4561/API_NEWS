import { PropsWithChildren } from "react";

import { ICategory } from "@/libs/request";
import { Container } from "@chakra-ui/react";

import BackTop from "./BackTop";
import Footer from "./Footer";
import Header from "./Header";

interface IProps extends PropsWithChildren {
  categories: ICategory[];
  categoryData?: ICategory;
}

const Layout = ({ children, categories, categoryData }: IProps) => {
  return (
    <>
      <Header categories={categories} categoryData={categoryData} />
      <Container maxW="container.md" as="main" flex={1} py="16px">
        {children}
      </Container>
      <Footer />
      <BackTop />
    </>
  );
};

export default Layout;
