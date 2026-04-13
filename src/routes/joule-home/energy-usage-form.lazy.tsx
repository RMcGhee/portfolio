import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  SegmentedControl,
  Tooltip,
} from "@radix-ui/themes";
import { getDdData } from "../../apis/worker-apis";
import { LeftGrow, ValidatedField } from "../../common/Basic";
import { HelpPopover } from "../../common/HelpPopover";
import { isEmpty } from "../../common/Util";
import {
  type DegreeDayData,
  initDegreeDayMonths,
} from "../../entities/DegreeDayData";
import {
  type EnergyFormData,
  fixtureElectricUsage,
  fixtureGasUsage,
  initEnergyForm,
  type MonthlyUsage,
  validateEnergyFormData,
} from "../../entities/EnergyFormData";
import type { FormData } from "../../entities/FormData";
import { useJouleHomeContext } from "../../entities/joule-home-context";

export const Route = createLazyFileRoute("/joule-home/energy-usage-form")({
  component: EnergyUsageForm,
});

function EnergyUsageForm() {
  const bypassCorsToken = import.meta.env.VITE_BYPASS_CORS_TOKEN;

  const { formData, setFormData } = useJouleHomeContext();
  const [energyFormData, setEnergyFormData] = useState<EnergyFormData>(
    initEnergyForm(formData),
  );

  const [formValid, setFormValid] = useState(false);
  const [showHelpPopover, setShowHelpPopover] = useState(false);

  const months = Object.keys(fixtureElectricUsage).map(
    (mon) => mon[0].toUpperCase() + mon.substring(1),
  );

  const fillWithExampleData = (): void => {
    setEnergyFormData({
      ...energyFormData,
      monthlyElectricUsage: { ...fixtureElectricUsage },
      monthlyGasUsage: { ...fixtureGasUsage },
    });
  };

  const degreeDayDataOutOfDate = (degreeDayData: DegreeDayData): boolean => {
    let res =
      isEmpty(degreeDayData) ||
      degreeDayData.cooling.jan === "" ||
      degreeDayData.zip !== formData.selectedClimate;
    return res;
  };

  const { data } = useQuery({
    queryKey: [`get-dd-data--${formData.selectedClimate}`],
    queryFn: () => getDdData(formData.selectedClimate, bypassCorsToken),
    staleTime: 300 * 1000,
    enabled: formData.selectedClimate.length === 5,
  });

  useEffect(() => {
    if (degreeDayDataOutOfDate(formData.degreeDayData)) {
      if (data) {
        let draftData = {
          year_2021: {},
          year_2022: {},
          year_2023: {},
        } as DegreeDayData;
        draftData.cooling = initDegreeDayMonths(data.cooling);
        draftData.heating = initDegreeDayMonths(data.heating);
        draftData.year_2021.cooling = initDegreeDayMonths(
          data.year_2021.cooling,
        );
        draftData.year_2021.heating = initDegreeDayMonths(
          data.year_2021.heating,
        );
        draftData.year_2022.cooling = initDegreeDayMonths(
          data.year_2022.cooling,
        );
        draftData.year_2022.heating = initDegreeDayMonths(
          data.year_2022.heating,
        );
        draftData.year_2023.cooling = initDegreeDayMonths(
          data.year_2023.cooling,
        );
        draftData.year_2023.heating = initDegreeDayMonths(
          data.year_2023.heating,
        );

        setFormData((prev) => ({
          ...prev,
          degreeDayData: draftData,
        }));
      }
    }
  }, [data]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      monthlyElectricUsage: { ...energyFormData.monthlyElectricUsage },
      monthlyGasUsage: { ...energyFormData.monthlyGasUsage },
      dataYear: energyFormData.dataYear,
      electricPrice: energyFormData.electricPrice,
      gasPrice: energyFormData.gasPrice,
      gasUnits: energyFormData.gasUnits,
    }));
  }, [energyFormData]);

  useEffect(() => {
    setFormValid(validateEnergyFormData(formData));
  }, [formData]);

  const helpText = (
    <div>
      <h3>Monthly electric or gas usage</h3>
      <p>
        You should be able to get the monthly usage from your electric and gas
        provider, and these should be in units of kWh (electric), and Ccf or
        therms/kBTU (gas). If you use a different energy source (propane, oil,
        kerosene, etc), then use your units for this. As long as you use the
        same units consistently, most calculations will be accurate.
      </p>
      <hr />
      <h3>Electric/gas price</h3>
      <p>
        The average price that your utility charges per unit of energy delivered
        ($/kWh for electricity, $/Ccf/therms for gas). If your utility charges
        rates on a time of use basis, simply use the average price, not
        including delivery fees (divide (total bill - delivery fees) by total
        usage).
      </p>
      <hr />
      <h3>Gas units; Ccf or kBTU</h3>
      <p>
        The units that your gas utility measures delivery in. Ccf and kBTU are
        fairly close (1.038 therms/Ccf), so if you don't know, it's fine to
        leave this as the default. therms and kBTU are the same. If you use a
        different fuel, just leave this as therms. Some efficiency results won't
        be relevant in this case, but the cost calculations will be accurate.
      </p>
    </div>
  );

  const rowSx = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1rem",
  } as React.CSSProperties;

  const monthlyForm = (
    <Box
      style={{
        justifyContent: "space-between",
        flexDirection: "column",
        gap: "16px",
        marginTop: "5px",
      }}
    >
      {months.map((month, i) => {
        return (
          <div style={rowSx} key={`${month}-row`}>
            <ValidatedField
              label={`${month} Electric Usage`}
              value={
                energyFormData.monthlyElectricUsage[
                  month.toLowerCase() as keyof MonthlyUsage
                ]
              }
              inputType="decimal"
              inputProps={{ inputMode: "decimal" }}
              InputProps={{
                endAdornment: <span>kWh</span>,
              }}
              InputLabelProps={{ shrink: true }}
              formOrder={i}
              setter={(e) =>
                setEnergyFormData({
                  ...energyFormData,
                  monthlyElectricUsage: {
                    ...energyFormData.monthlyElectricUsage,
                    [month.toLowerCase()]: e.target.value,
                  },
                })
              }
            />
            <ValidatedField
              label={`${month} Gas Usage`}
              value={
                energyFormData.monthlyGasUsage[
                  month.toLowerCase() as keyof MonthlyUsage
                ]
              }
              inputType="decimal"
              inputProps={{ inputMode: "decimal" }}
              InputProps={{
                endAdornment: <span>{energyFormData.gasUnits}</span>,
              }}
              InputLabelProps={{ shrink: true }}
              formOrder={i + 12}
              setter={(e) =>
                setEnergyFormData({
                  ...energyFormData,
                  monthlyGasUsage: {
                    ...energyFormData.monthlyGasUsage,
                    [month.toLowerCase()]: e.target.value,
                  },
                })
              }
            />
          </div>
        );
      })}
    </Box>
  );

  return (
    <LeftGrow>
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "16px",
          transition: "all 1s",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
          }}
        >
          Year for data
          <SegmentedControl.Root
            value={String(energyFormData.dataYear)}
            onValueChange={(newYear: string) => {
              if (newYear !== null) {
                setEnergyFormData({
                  ...energyFormData,
                  dataYear: Number(newYear) as 2021 | 2022 | 2023,
                });
              }
            }}
          >
            <SegmentedControl.Item value="2023">2023</SegmentedControl.Item>
            <SegmentedControl.Item value="2022">2022</SegmentedControl.Item>
            <SegmentedControl.Item value="2021">2021</SegmentedControl.Item>
          </SegmentedControl.Root>
        </Box>
        <Tooltip content="Data comes from an 1800 sqft home in the midwest, 2023, use Zip 64124.">
          <Button variant="outline" onClick={fillWithExampleData}>
            Use Example Data
          </Button>
        </Tooltip>
        <Box style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {monthlyForm}
        </Box>
        <div style={rowSx}>
          <ValidatedField
            label="Electric Price/kWh"
            value={energyFormData.electricPrice}
            inputType="decimal"
            inputProps={{ inputMode: "decimal" }}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
            formOrder={24}
            setter={(e) =>
              setEnergyFormData({
                ...energyFormData,
                electricPrice: e.target.value,
              })
            }
          />
          <ValidatedField
            label={`Gas Price/${energyFormData.gasUnits}`}
            value={energyFormData.gasPrice}
            inputType="decimal"
            inputProps={{ inputMode: "decimal" }}
            InputProps={{
              startAdornment: <span>$</span>,
            }}
            formOrder={25}
            setter={(e) =>
              setEnergyFormData({ ...energyFormData, gasPrice: e.target.value })
            }
          />
        </div>
        <SegmentedControl.Root
          value={energyFormData.gasUnits}
          onValueChange={(newUnits: string) =>
            setEnergyFormData({
              ...energyFormData,
              gasUnits: newUnits as "ccf" | "therm",
            })
          }
        >
          <SegmentedControl.Item value="ccf">Ccf</SegmentedControl.Item>
          <SegmentedControl.Item value="therm">
            therms/kBTU
          </SegmentedControl.Item>
        </SegmentedControl.Root>
        <IconButton
          variant="soft"
          color="purple"
          style={{
            alignSelf: "flex-end",
            marginLeft: "auto",
            marginRight: "5%",
          }}
          onClick={() => setShowHelpPopover(!showHelpPopover)}
        >
          <span>?</span>
        </IconButton>
        <HelpPopover
          helpText={helpText}
          isOpen={showHelpPopover}
          onClose={() => setShowHelpPopover(false)}
        ></HelpPopover>
        <Box
          style={{
            position: "relative",
            padding: "16px",
            marginBottom: "30px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            variant="outline"
            asChild
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
              left: 0,
            }}
          >
            <Link to="/joule-home/current-system">Previous</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            disabled={!formValid}
            style={{
              transition: "width 0.5s ease-in-out, opacity 0.5s ease-in-out",
              left: 0,
            }}
          >
            <Link to="/joule-home/analysis">Next</Link>
          </Button>
        </Box>
      </Box>
    </LeftGrow>
  );
}
