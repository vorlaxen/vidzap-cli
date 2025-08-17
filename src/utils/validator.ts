export const validator = {
  isNonEmptyString: (input: string) => typeof input === "string" && input.trim().length > 0,
};