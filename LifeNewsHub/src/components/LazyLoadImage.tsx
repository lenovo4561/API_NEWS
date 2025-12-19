"use client";

import {
  AspectRatio,
  AspectRatioProps,
  Image,
  Skeleton,
  StyleProps,
} from "@chakra-ui/react";
import { useInView, motion } from "framer-motion";
import { memo, useRef, useState } from "react";

interface IProps extends StyleProps {
  ratio: AspectRatioProps["ratio"];
  alt: string;
  src: string;
}

const LazyLoadImage = ({ ratio, alt, src, ...restProps }: IProps) => {
  const imgRef = useRef(null);
  const [isShow, setIsShow] = useState(false);
  const isInView = useInView(imgRef, { once: true });
  return (
    <AspectRatio ratio={ratio} as={Skeleton} isLoaded={isShow} {...restProps}>
      <Image
        border="1px solid rgba(0,0,0,0.075)"
        alt={alt}
        as={motion.img}
        ref={imgRef}
        objectFit="cover"
        src={isInView ? src : ""}
        onLoad={() => {
          setIsShow(true);
        }}
      />
    </AspectRatio>
  );
};

export default memo(LazyLoadImage);
