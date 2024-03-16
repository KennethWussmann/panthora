// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isError = (error: any): error is Error => "message" in error;
