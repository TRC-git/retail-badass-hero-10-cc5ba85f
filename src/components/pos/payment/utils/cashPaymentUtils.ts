
export const calculateChange = (amountTendered: string, total: number): number => {
  const tendered = parseFloat(amountTendered) || 0;
  return Math.max(0, tendered - total);
};

export const handleNumpadInput = (
  value: string,
  amountTendered: string,
  setAmountTendered: (value: string) => void
): void => {
  if (value === "clear") {
    setAmountTendered("0");
    return;
  }

  if (value === "backspace") {
    const newValue = amountTendered.length > 1 ? amountTendered.slice(0, -1) : "0";
    setAmountTendered(newValue);
    return;
  }

  if ([10, 20, 50, 100].includes(Number(value))) {
    setAmountTendered(value);
    return;
  }

  if (amountTendered === "0" && value !== ".") {
    setAmountTendered(value);
  } else if (value === "." && amountTendered.includes(".")) {
    // Do nothing if trying to add a second decimal point
    return;
  } else {
    setAmountTendered(amountTendered + value);
  }
};
