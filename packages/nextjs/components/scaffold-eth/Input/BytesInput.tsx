import { useCallback } from "react";
import { bytesToString, isHex, toBytes, toHex } from "viem";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";

export const BytesInput = ({ value, onChange, name, placeholder, disabled }: CommonInputProps) => {
  const convertStringToBytes = useCallback(() => {
    onChange(isHex(value) ? bytesToString(toBytes(value)) : toHex(toBytes(value)));
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
          onClick={convertStringToBytes}
        >
          #
        </div>
      }
    />
  );
};
