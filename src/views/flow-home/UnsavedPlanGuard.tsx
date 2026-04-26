import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertDialog, Button, Flex, Text } from "@radix-ui/themes";
import {
  useFlowHomeContext,
  isPlanDirty,
} from "../../entities/flow-home/flow-home-context";

type GuardContextValue = {
  /**
   * Runs `next` immediately when the current plan draft is clean.
   * When dirty, prompts the user with an AlertDialog offering
   * Save / Discard / Cancel before running `next`.
   */
  guardNavigate: (next: () => void) => void;
};

const UnsavedPlanGuardContext = createContext<GuardContextValue | undefined>(
  undefined,
);

export function useUnsavedPlanGuard(): GuardContextValue {
  const ctx = useContext(UnsavedPlanGuardContext);
  if (!ctx) {
    throw new Error(
      "useUnsavedPlanGuard must be used inside an UnsavedPlanGuardProvider",
    );
  }
  return ctx;
}

export function UnsavedPlanGuardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { inputs, dispatch } = useFlowHomeContext();
  const dirty = isPlanDirty(inputs);
  const canSave = Boolean(inputs.plan.name.trim());

  const [open, setOpen] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);

  const guardNavigate = useCallback(
    (next: () => void) => {
      if (!dirty) {
        next();
        return;
      }
      pendingRef.current = next;
      setOpen(true);
    },
    [dirty],
  );

  const runPending = () => {
    const next = pendingRef.current;
    pendingRef.current = null;
    setOpen(false);
    if (next) next();
  };

  const handleSave = () => {
    if (!canSave) return;
    dispatch({ type: "savePlan" });
    runPending();
  };

  const handleDiscard = () => {
    runPending();
  };

  const handleCancel = () => {
    pendingRef.current = null;
    setOpen(false);
  };

  return (
    <UnsavedPlanGuardContext.Provider value={{ guardNavigate }}>
      {children}
      <AlertDialog.Root
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCancel();
        }}
      >
        <AlertDialog.Content maxWidth="28rem">
          <AlertDialog.Title>Unsaved changes</AlertDialog.Title>
          <AlertDialog.Description size="2">
            You have unsaved changes to this plan. What would you like to do
            before leaving?
          </AlertDialog.Description>

          {!canSave && (
            <Text as="p" size="1" color="amber" mt="2">
              Give the plan a name to enable saving, or discard your changes.
            </Text>
          )}

          <Flex gap="2" mt="4" justify="end" wrap="wrap">
            <Button variant="soft" color="gray" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="outline" color="red" onClick={handleDiscard}>
              Discard changes
            </Button>
            <Button variant="solid" disabled={!canSave} onClick={handleSave}>
              Save & continue
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </UnsavedPlanGuardContext.Provider>
  );
}
