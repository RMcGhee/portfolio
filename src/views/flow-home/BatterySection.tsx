import { Flex, Heading, Slider, Text, TextField } from "@radix-ui/themes";
import { useFlowHomeContext } from "../../entities/flow-home/flow-home-context";

/**
 * A control row showing a slider + numeric readout on one line, with a
 * descriptive label + helper text above.
 */
function PercentSliderField({
  label,
  helper,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  helper?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (pct: number) => void;
}) {
  return (
    <Flex direction="column" gap="1" style={{ maxWidth: "28rem" }}>
      <Text as="label" size="2" color="gray">
        {label}
      </Text>
      {helper && (
        <Text size="1" color="gray">
          {helper}
        </Text>
      )}
      <Flex align="center" gap="3">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0] ?? value)}
          style={{ flexGrow: 1 }}
        />
        <Text
          size="2"
          style={{
            fontFamily: "monospace",
            minWidth: "3.5rem",
            textAlign: "right",
          }}
        >
          {value.toFixed(step < 1 ? 1 : 0)}%
        </Text>
      </Flex>
    </Flex>
  );
}

export function BatterySection() {
  const { inputs, dispatch } = useFlowHomeContext();
  const { batterySpec } = inputs;

  const handleCapacityChange = (raw: string) => {
    // Allow empty input so the user can clear the field; normalize to 0.
    if (raw.trim() === "") {
      dispatch({ type: "setBatteryCapacity", capacityKwh: 0 });
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      dispatch({ type: "setBatteryCapacity", capacityKwh: n });
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex direction="column" gap="1">
        <Heading size="4">Battery System</Heading>
        <Text size="2" color="gray">
          Specs for a potential battery system. These are used to model how much
          of your usage could shift off-peak, and how much you'd save.
        </Text>
      </Flex>

      {/* Capacity */}
      <Flex direction="column" gap="1" style={{ maxWidth: "16rem" }}>
        <Text as="label" size="2" color="gray">
          Usable capacity
        </Text>
        <Text size="1" color="gray">
          Total storage the battery can deliver from full to empty.
        </Text>
        <TextField.Root
          size="2"
          variant="surface"
          type="number"
          inputMode="decimal"
          min={0}
          step={0.1}
          placeholder="e.g. 13.5"
          value={
            batterySpec.capacityKwh === 0 ? "" : String(batterySpec.capacityKwh)
          }
          onChange={(e) => handleCapacityChange(e.target.value)}
        >
          <TextField.Slot side="right">
            <Text size="2" color="gray">
              kWh
            </Text>
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      {/* Round-trip efficiency */}
      <PercentSliderField
        label="Round-trip efficiency"
        helper="Fraction of energy returned when discharging what was stored. Typical Li-ion systems are 85–95%."
        value={batterySpec.roundTripEfficiencyPct}
        min={50}
        max={100}
        step={0.5}
        onChange={(pct) =>
          dispatch({ type: "setBatteryRoundTripEfficiency", pct })
        }
      />

      {/* Depth of discharge */}
      <PercentSliderField
        label="Depth of discharge"
        helper="How much of the battery's nameplate capacity you'll actually use. Lower DoD extends battery life."
        value={batterySpec.depthOfDischargePct}
        min={50}
        max={100}
        step={1}
        onChange={(pct) =>
          dispatch({ type: "setBatteryDepthOfDischarge", pct })
        }
      />
    </Flex>
  );
}
