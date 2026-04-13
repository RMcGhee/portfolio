import { Select, Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import type { ZipDist } from "../entities/ZipDist";
import { isEmpty } from "./Util";

type SelectClimateProps = {
  zipData: ZipDist;
  selectedClimate: string;
  setSelectedClimate: (data: string) => void;
  label?: string;
  hidden?: boolean;
  style?: React.CSSProperties;
  InputProps?: {
    style?: React.CSSProperties;
  };
};

type ClimateMenuItem = {
  itemKey: string | number;
  value: string | number;
};

const generateMenuItems = (zipData: ZipDist): ClimateMenuItem[] => {
  if (!isEmpty(zipData)) {
    return Array.from({ length: 5 }, (_, i) => {
      const cityKey = `near_city_${i + 1}` as keyof ZipDist;
      const zipKey = `near_zip_${i + 1}` as keyof ZipDist;
      return { itemKey: zipData[cityKey], value: zipData[zipKey] };
    });
  } else {
    return [{ itemKey: "placeholder", value: "" }];
  }
};

export const SelectClimate: React.FC<SelectClimateProps> = ({
  zipData,
  selectedClimate,
  setSelectedClimate,
  label,
  hidden,
  style,
  InputProps,
}) => {
  const [menuItems, setMenuItems] = useState<ClimateMenuItem[]>(
    generateMenuItems(zipData),
  );

  useEffect(() => {
    setMenuItems(generateMenuItems(zipData));
  }, [zipData]);

  useEffect(() => {
    if (menuItems.length > 1) {
      if (selectedClimate === "") {
        setSelectedClimate(menuItems[0].value as string);
      }
    }
  }, [menuItems]);

  if (hidden) return null;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "4px", ...style }}
    >
      {label && (
        <Text as="label" size="2" color="gray">
          {label}
        </Text>
      )}
      <Select.Root value={selectedClimate} onValueChange={setSelectedClimate}>
        <Select.Trigger style={InputProps?.style} />
        <Select.Content>
          {menuItems.map((item) => (
            <Select.Item key={String(item.itemKey)} value={String(item.value)}>
              {item.value} : {item.itemKey}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
};
