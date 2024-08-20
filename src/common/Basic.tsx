import React, { useState, ReactElement } from 'react';
import { Grow, TextField, TextFieldProps, Tooltip } from '@mui/material';

const prod_env = true;
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const btuInkWh = 3412;
export const btuInCcf = 103900;
export const copInSeer = 0.293;
export const supabaseBaseUrl = prod_env ? 'https://uqjgvhebgvzrbbfjcxsg.supabase.co/functions/v1/' : 'http://127.0.0.1:54321/functions/v1/';

interface LeftGrowProps {
    children: ReactElement;
    timeout?: number;
    trigger?: boolean;
  }
  
  export const LeftGrow: React.FC<LeftGrowProps> = ({ children, timeout = 1500, trigger = true }) => {
  return (
    <Grow in={trigger} style={{ transformOrigin: '-30% 50%' }} timeout={timeout}>
      {children}
    </Grow>
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

export const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ children, img, maxHeight='40vh', trigger = true, timeout = 1500, altText }) => {
return (
  <LeftGrow trigger={trigger}>
      <div>
          <img src={img} alt={altText} style={{ maxWidth: '95vw', maxHeight: maxHeight, objectFit: 'contain' }}></img>
          {children}
          <br/>
      </div>
  </LeftGrow>
  )
};

export type ValidatedFieldProps = TextFieldProps & {
  len?: number;
  inputType?: 'decimal' | 'text' | 'int' | string;
  invalidMsg?: string;
  formOrder?: number;
  /** 
   * setter is always called AFTER validation, regardless of whether validation fails
   * @param value Change event for the field  */
  setter: (value: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
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
  inputType = 'text',
  invalidMsg,
  setter,
  formOrder,
  ...textFieldProps
}) => {
  const [error, setError] = useState(false);

  const validateInput = (input: string) => {
    if (len > 0 && input.length > len) return false;
    if (inputType === 'decimal' && !/^[0-9]*\.?[0-9]*$/.test(input)) return false;
    if (inputType === 'int' && !/^[0-9]*$/.test(input)) return false;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const isValid = validateInput(e.target.value);
    setError(!isValid);
    setter(e);
  };

  const getErrorMsg = () => {
    if (invalidMsg) return invalidMsg;
    return len > 0 ? `Enter only ${inputType}, max ${len} characters` : `Enter only ${inputType}`;
  };

  // Merge incoming transitions, don't overwrite.
  const fieldStyle = {
    ...textFieldProps.style,
    transition: `${textFieldProps.style?.transition ? textFieldProps.style?.transition + ', ' : ''}background-color 1.0s ease`,
    backgroundColor: textFieldProps.disabled ? '#202020' : 'transparent',
  };

  return (
    <Tooltip title={error ? getErrorMsg() : ''} open={error} arrow>
      <TextField
        {...textFieldProps}
        error={error}
        onChange={handleChange}
        onKeyUp={formOrder !== undefined ? (e) => maybeGoNextField(e) : undefined}
        size={ textFieldProps.disabled ? 'small' : 'medium' }
        inputProps={{ formorder: formOrder }}
        style={{
          ...fieldStyle,
        }}
      />
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
export const maybeGoNextField: (e: React.KeyboardEvent<HTMLDivElement>, disabledElement?: HTMLElement | null) => void = 
  (e: React.KeyboardEvent<HTMLDivElement>, disabledElement: HTMLElement | null = null) => {
  let targetElement: HTMLElement | null = disabledElement !== null ? disabledElement : e.target as HTMLElement;
  if (e.key === 'Enter') {
    let currentIdx = targetElement?.getAttribute('formorder');
    if (currentIdx === undefined || currentIdx === null) return;

    const currentOrder = parseInt(currentIdx);
    const allFormOrderElements = Array.from<HTMLElement>(document.querySelectorAll('[formOrder]'))
      .filter((a) => a.getAttribute('formOrder') !== null)
      .sort((a, b) => parseInt(a.getAttribute('formOrder') ?? '') - parseInt(b.getAttribute('formOrder') ?? ''));

    const nextIndex = currentOrder + 1;
    if (nextIndex >= allFormOrderElements.length) {
      allFormOrderElements[currentOrder].blur();
    } else {
      let elem = allFormOrderElements[nextIndex];
      if (elem) {
        if (elem.getAttribute('disabled') !== null) {
          maybeGoNextField(e, elem);
        } else {
          e?.preventDefault();
          elem.focus();
        }
      }
    }
  }
};