import { Text, TextField, Tooltip } from "@radix-ui/themes";
import React, { useState, type ReactElement } from "react";

const prod_env = true;
export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const btuInkWh = 3412;
export const btuInCcf = 103900;
export const copInSeer = 0.293;
export const supabaseBaseUrl = prod_env
  ? "https://uqjgvhebgvzrbbfjcxsg.supabase.co/functions/v1/"
  : "http://127.0.0.1:54321/functions/v1/";

interface LeftGrowProps {
  children: ReactElement;
  timeout?: number;
  trigger?: boolean;
}

export const LeftGrow: React.FC<LeftGrowProps> = ({
  children,
  timeout = 1500,
  trigger = true,
}) => {
  return (
    <div
      style={{
        opacity: trigger ? 1 : 0,
        transform: trigger ? "scale(1)" : "scale(0.8)",
        transformOrigin: "-30% 50%",
        transition: `opacity ${timeout}ms ease, transform ${timeout}ms ease`,
      }}
    >
      {children}
    </div>
  );
};

interface AnnotatedImageProps {
  children: ReactElement;
  img: string;
  maxHeight?: string;
  trigger: boolean;
  timeout?: number;
  altText?: string;
}

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({
  children,
  img,
  maxHeight = "40vh",
  trigger = true,
  timeout = 1500,
  altText,
}) => {
  return (
    <LeftGrow trigger={trigger}>
      <div>
        <img
          src={img}
          alt={altText}
          style={{
            maxWidth: "95vw",
            maxHeight: maxHeight,
            objectFit: "contain",
          }}
        ></img>
        {children}
        <br />
      </div>
    </LeftGrow>
  );
};

export type ValidatedFieldProps = {
  len?: number;
  inputType?: "decimal" | "text" | "int" | string;
  invalidMsg?: string;
  formOrder?: number;
  /**
   * setter is always called AFTER validation, regardless of whether validation fails
   * @param value Change event for the field  */
  setter: (value: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  value?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  style?: React.CSSProperties;
  InputProps?: {
    endAdornment?: React.ReactNode;
    startAdornment?: React.ReactNode;
    style?: React.CSSProperties;
  };
  InputLabelProps?: {
    shrink?: boolean;
  };
  inputProps?: {
    inputMode?: string;
  };
};

/**
 * @param len Length limit if any. Leave blank or 0 for unrestricted.
 * @param inputType Restrict the input type to text, decimal, or int.
 * @param setter The setter for the state variable, always called AFTER validation, regarless of whether or not validation fails.
 * @param formOrder If specified, the int order that this element falls in a form. i.e., if 0 and 1 specified, enter will focus
 * 1 after 0, and then defocus 1 if enter is hit.
 * @returns
 */
export const ValidatedField: React.FC<ValidatedFieldProps> = ({
  len = 0,
  inputType = "text",
  invalidMsg,
  setter,
  formOrder,
  label,
  value,
  disabled,
  hidden,
  style,
  InputProps,
  InputLabelProps,
  inputProps,
}) => {
  const [error, setError] = useState(false);

  const validateInput = (input: string) => {
    if (len > 0 && input.length > len) return false;
    if (inputType === "decimal" && !/^[0-9]*\.?[0-9]*$/.test(input))
      return false;
    if (inputType === "int" && !/^[0-9]*$/.test(input)) return false;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isValid = validateInput(e.target.value);
    setError(!isValid);
    setter(e);
  };

  const getErrorMsg = () => {
    if (invalidMsg) return invalidMsg;
    return len > 0
      ? `Enter only ${inputType}, max ${len} characters`
      : `Enter only ${inputType}`;
  };

  const fieldStyle: React.CSSProperties = {
    ...style,
    transition: `${style?.transition ? style.transition + ", " : ""}background-color 1.0s ease`,
    backgroundColor: disabled ? "#202020" : "transparent",
    ...(hidden ? { display: "none" } : {}),
  };

  return (
    <Tooltip content={error ? getErrorMsg() : ""} open={error}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          ...fieldStyle,
        }}
      >
        {label && (
          <Text as="label" size="2" color="gray">
            {label}
          </Text>
        )}
        <TextField.Root
          size="2"
          variant="surface"
          value={(value as string) ?? ""}
          onChange={handleChange}
          onKeyUp={
            formOrder !== undefined ? (e) => maybeGoNextField(e) : undefined
          }
          disabled={disabled}
          inputMode={
            inputProps?.inputMode as React.HTMLAttributes<HTMLInputElement>["inputMode"]
          }
          data-formorder={formOrder}
          style={{
            ...InputProps?.style,
            color: error ? "var(--red-9)" : undefined,
          }}
        >
          {InputProps?.startAdornment && (
            <TextField.Slot side="left">
              {InputProps.startAdornment}
            </TextField.Slot>
          )}
          {InputProps?.endAdornment && (
            <TextField.Slot side="right">
              {InputProps.endAdornment}
            </TextField.Slot>
          )}
        </TextField.Root>
      </div>
    </Tooltip>
  );
};

/**
 * Use to get enter goes to next field in input behavior. Use in onKeyUp for all elements
 * in the form, and give each element a unique id. Pass in these ids as inputIds, in the
 * order that they should be in for next bevahior. currentIndex should represent the index
 * of the current input id in the array, i.e.: ['a', 'b'] input 'a' has index 0, 'b', 1.
 * The last element defocuses on enter.
 * EX: onKeyUp={(e) => maybeGoNextField(1, e, inputIds)}
 * @param e React.KeyboardEvent
 * @param disabledElement HTMLElement | null
 */
export const maybeGoNextField: (
  e: React.KeyboardEvent<HTMLDivElement>,
  disabledElement?: HTMLElement | null,
) => void = (
  e: React.KeyboardEvent<HTMLDivElement>,
  disabledElement: HTMLElement | null = null,
) => {
  let targetElement: HTMLElement | null =
    disabledElement !== null ? disabledElement : (e.target as HTMLElement);
  if (e.key === "Enter") {
    let currentIdx = targetElement?.getAttribute("data-formorder");
    if (currentIdx === undefined || currentIdx === null) return;

    const currentOrder = parseInt(currentIdx);
    const allFormOrderElements = Array.from<HTMLElement>(
      document.querySelectorAll("[data-formorder]"),
    )
      .filter((a) => a.getAttribute("data-formorder") !== null)
      .sort(
        (a, b) =>
          parseInt(a.getAttribute("data-formorder") ?? "") -
          parseInt(b.getAttribute("data-formorder") ?? ""),
      );

    const nextIndex = currentOrder + 1;
    if (nextIndex >= allFormOrderElements.length) {
      allFormOrderElements[currentOrder].blur();
    } else {
      let elem = allFormOrderElements[nextIndex];
      if (elem) {
        if (elem.getAttribute("disabled") !== null) {
          maybeGoNextField(e, elem);
        } else {
          e?.preventDefault();
          elem.focus();
        }
      }
    }
  }
};
