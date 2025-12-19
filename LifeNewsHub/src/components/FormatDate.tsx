import { memo } from "react";
import { Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

const FormatDate = ({ date }: { date: number }) => {
  return (
    <Text as="time" dateTime={`${dayjs.unix(date).format()}`}>
      {dayjs.unix(date).format("ll")}
    </Text>
  );
};

export default memo(FormatDate);
