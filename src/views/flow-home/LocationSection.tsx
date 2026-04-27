import { useState } from "react";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { ZipField } from "../../common/ZipField";
import { SelectClimate } from "../../common/SelectClimate";
import { useFlowHomeContext } from "../../entities/flow-home/flow-home-context";
import type { ZipDist } from "../../entities/ZipDist";
import { isEmpty } from "../../common/Util";

export function LocationSection() {
  const { inputs, dispatch } = useFlowHomeContext();
  const { zipCode, selectedStationZip } = inputs;

  // zipDist is derived, not persisted — react-query caches it and ZipField
  // hands it back here whenever the zip changes or the cache warms.
  const [zipDist, setZipDist] = useState<ZipDist>({} as ZipDist);

  const haveZipDistData = !isEmpty(zipDist);

  return (
    <Flex direction="column" gap="3">
      <Flex direction="column" gap="1">
        <Heading size="4">Location & Climate</Heading>
        <Text size="2" color="gray">
          Enter your zip code so we can model how weather affects your energy
          use. We'll match you to the nearest weather station with long-term
          data.
        </Text>
      </Flex>

      <Flex gap="2" align="end" wrap="wrap">
        <ZipField
          label="Your zip code"
          value={zipCode}
          zipCode={zipCode}
          len={5}
          inputType="int"
          inputProps={{ inputMode: "numeric" }}
          style={{
            width: haveZipDistData ? "12rem" : "18rem",
            transition: "width 0.4s ease-in-out",
          }}
          InputProps={{
            style: {
              borderTopRightRadius: haveZipDistData ? "0" : undefined,
              borderBottomRightRadius: haveZipDistData ? "0" : undefined,
            },
          }}
          setter={(e) =>
            dispatch({ type: "setZipCode", zipCode: e.target.value })
          }
          onZipDataReceived={(data, zip) => {
            setZipDist(data);
            // If the stored station zip isn't in the new nearby list,
            // fall back to the closest one so the select never points at
            // a stale station from a previous zip.
            if (data && !isEmpty(data)) {
              const nearbyZips = [
                data.near_zip_1,
                data.near_zip_2,
                data.near_zip_3,
                data.near_zip_4,
                data.near_zip_5,
              ]
                .filter(Boolean)
                .map(String);
              if (
                !selectedStationZip ||
                !nearbyZips.includes(selectedStationZip)
              ) {
                dispatch({
                  type: "setSelectedStationZip",
                  zip: String(data.near_zip_1 ?? ""),
                });
              }
            }
            // Mirror the entered zip to context (ZipField calls this with
            // the current input value).
            if (zip !== zipCode) {
              dispatch({ type: "setZipCode", zipCode: zip });
            }
          }}
        />

        <SelectClimate
          label="Nearest weather station"
          hidden={!haveZipDistData}
          style={{
            width: haveZipDistData ? "20rem" : "0",
            opacity: haveZipDistData ? 1 : 0,
            transition: "width 0.4s ease-in-out, opacity 0.4s ease-in-out",
          }}
          InputProps={{
            style: {
              borderTopLeftRadius: "0",
              borderBottomLeftRadius: "0",
            },
          }}
          zipData={zipDist}
          selectedClimate={selectedStationZip}
          setSelectedClimate={(zip) =>
            dispatch({ type: "setSelectedStationZip", zip })
          }
        />
      </Flex>
    </Flex>
  );
}
