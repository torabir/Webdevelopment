// DETTE ER FOR AT VI SKAL KUNNE IMPORTE BILDER TIL WEBSIDEN

// src/declarations.d.ts
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}
