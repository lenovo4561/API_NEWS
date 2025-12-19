import "react-tabs-scrollable/dist/rts.css";

import { useRouter } from "next/router";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { Tab, Tabs } from "react-tabs-scrollable";

import { ICategory } from "@/libs/request";

const Categories = ({
  category,
  categories,
}: {
  category?: string;
  categories: ICategory[];
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<number>();

  useEffect(() => {
    if (categories && categories.length) {
      setActiveTab(() => {
        return categories.findIndex((item) => item.display_name === category);
      });
    }
  }, [categories, category]);

  if (!categories || typeof activeTab === "undefined") {
    return null;
  }
  return (
    <Tabs
      hideNavBtns
      activeTab={activeTab}
      mode="scrollSelectedToCenterFromView"
      onTabClick={(_: BaseSyntheticEvent, index: number) => {
        const display_name = categories[index].display_name;
        router.push(`/${display_name}`);
      }}
    >
      {categories.map(({ id, display_name }: ICategory) => {
        return (
          <Tab fontSize="12px" key={id}>
            {display_name}
          </Tab>
        );
      })}
    </Tabs>
  );
};

export default Categories;
