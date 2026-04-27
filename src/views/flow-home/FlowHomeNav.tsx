import { SegmentedControl } from "@radix-ui/themes";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useUnsavedPlanGuard } from "./UnsavedPlanGuard";

type StepValue = "about" | "plans" | "usage" | "profile";

const STEPS: { value: StepValue; label: string; path: string }[] = [
  { value: "about", label: "About", path: "/flow-home" },
  { value: "plans", label: "Plans", path: "/flow-home/cost-schedule" },
  { value: "usage", label: "Usage", path: "/flow-home/usage" },
  { value: "profile", label: "Profile", path: "/flow-home/profile" },
];

function pathToStep(pathname: string): StepValue {
  if (pathname.startsWith("/flow-home/cost-schedule")) return "plans";
  if (pathname.startsWith("/flow-home/usage")) return "usage";
  if (pathname.startsWith("/flow-home/profile")) return "profile";
  return "about";
}

export function FlowHomeNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = pathToStep(pathname);
  const { guardNavigate } = useUnsavedPlanGuard();

  const handleChange = (value: string) => {
    const step = STEPS.find((s) => s.value === value);
    if (step) guardNavigate(() => navigate({ to: step.path }));
  };

  return (
    <SegmentedControl.Root
      className="flow-home-nav"
      value={current}
      onValueChange={handleChange}
      size="2"
    >
      {STEPS.map((step) => (
        <SegmentedControl.Item key={step.value} value={step.value}>
          {step.label}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  );
}
