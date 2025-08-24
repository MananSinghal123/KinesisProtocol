import { useCallback } from "react";
import { hexToString, isHex, stringToHex } from "viem";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const Bytes32Input = ({ value, onChange, name, placeholder, disabled }: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(isHex(value) ? hexToString(value, { size: 32 }) : stringToHex(value, { size: 32 }));
  }, [onChange, value]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      suffix={
        <div
          className={`self-center cursor-pointer text-xl font-semibold px-4 py-2 rounded-r-xl transition-all duration-200 ${
            disabled 
              ? "text-gray-400 cursor-not-allowed" 
              : "text-blue-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
          }`}
          onClick={convertStringToBytes32}
        >
          #
        </div>
      }
    />
  );
};
