import { ChangeEvent, FocusEvent, ReactNode, useCallback, useEffect, useRef } from "react";
import { CommonInputProps } from "~~/components/scaffold-eth";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
};

export const InputBase = <T extends { toString: () => string } | undefined = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
}: InputBaseProps<T>) => {
  const inputReft = useRef<HTMLInputElement>(null);

  let modifier = "";
  if (error) {
    modifier = "border-red-300 bg-red-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200";
  } else if (disabled) {
    modifier = "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed";
  } else {
    modifier = "border-gray-200 bg-white hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200";
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  // Runs only when reFocus prop is passed, useful for setting the cursor
  // at the end of the input. Example AddressInput
  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (reFocus !== undefined) {
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
    }
  };
  useEffect(() => {
    if (reFocus !== undefined && reFocus === true) inputReft.current?.focus();
  }, [reFocus]);

  return (
    <div className={`flex border-2 bg-white rounded-2xl text-gray-900 transition-all duration-200 ${modifier}`}>
      {prefix}
      <input
        className="input bg-transparent focus:outline-none h-[2.2rem] min-h-[2.2rem] px-4 border-0 w-full font-medium placeholder:text-gray-400 text-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed"
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        ref={inputReft}
        onFocus={onFocus}
      />
      {suffix}
    </div>
  );
};
