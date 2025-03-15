
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
    setAmountTendered((prev) => 
      prev.length > 1 ? prev.slice(0, -1) : "0"
    );
    return;
  }

  if ([10, 20, 50, 100].includes(Number(value))) {
    setAmountTendered(value);
    return;
  }

  setAmountTendered((prev) => {
    if (prev === "0" && value !== ".") {
      return value;
    }
    if (value === "." && prev.includes(".")) {
      return prev;
    }
    return prev + value;
  });
};
