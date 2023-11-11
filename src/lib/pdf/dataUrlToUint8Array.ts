export const dataURLtoUint8Array = (dataURL: string) => {
  const base64String = dataURL.split(",")[1]!;
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};
