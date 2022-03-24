export type ArrayElement<TArrayType extends unknown[]> = TArrayType extends readonly (infer TElementType)[] ? TElementType : never;
