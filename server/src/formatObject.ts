export const formatObject = (obj: any, indent: number = 2): string => {
  if (!obj) return "";

  return `{
${Object.entries(obj)
  .map(([key, value]) => {
    const indentation = " ".repeat(indent);
    // 处理对象类型的值
    if (value && typeof value === "object") {
      return `${indentation}${key}: ${formatObject(value, indent + 2)}`;
    }
    // 处理字符串变量（不加引号）
    if (
      value &&
      typeof value === "string" &&
      (value.includes("Key") || value.includes("Time") || value.includes("Id"))
    ) {
      return `${indentation}${key}: ${value}`;
    }
    // 处理普通字符串（加引号）
    if (typeof value === "string") {
      return `${indentation}${key}: "${value}"`;
    }
    // 处理数字等其他类型
    return `${indentation}${key}: ${value}`;
  })
  .join(",\n")}\n${" ".repeat(indent - 2)}}`; // 最后的闭合括号缩进
};
