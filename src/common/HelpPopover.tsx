import { Box, Modal, SxProps } from "@mui/material";
import theme from "../base-theme";

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
    const popoverSx: SxProps = {
      position: 'absolute',
      top: '24%',
      left: '24%',
      transform: 'translate(-24%, -24%)',
      backgroundColor: 'background.paper',
      border: `2px solid ${theme.palette.secondary.main}`,
      boxShadow: 24,
      p: 2,
      borderRadius: '7px',
      maxWidth: '400px',
      maxHeight: '90vh',
      overflow: 'auto',
    };

    return (
      <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box padding={2} sx={popoverSx}>
          {helpText}
        </Box>
      </Modal>
    );
  };