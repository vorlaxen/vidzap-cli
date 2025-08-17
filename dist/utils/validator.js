export const validator = {
    isNonEmptyString: (input) => typeof input === "string" && input.trim().length > 0,
};
