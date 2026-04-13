import { Dialog, Flex } from "@radix-ui/themes";

export type HelpPopoverProps = {
  helpText: JSX.Element;
  isOpen: boolean;
  onClose: () => void;
};

export const HelpPopover: React.FC<HelpPopoverProps> = ({
  helpText,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Content
        maxWidth="400px"
        style={{
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {helpText}
        <Flex justify="end" mt="4">
          <Dialog.Close>
            <button
              onClick={onClose}
              style={{
                cursor: "pointer",
                background: "none",
                border: "1px solid var(--gray-7)",
                borderRadius: "4px",
                padding: "4px 12px",
                color: "var(--gray-12)",
              }}
            >
              Close
            </button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
