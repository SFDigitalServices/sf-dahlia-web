export type Adapter<From, To> = (item: From) => To

export const ListAdapter =
  <From, To>(adapter: Adapter<From, To>): Adapter<From[], To[]> =>
  (fromObjects: From[]): To[] =>
    fromObjects.map((element) => adapter(element)) ?? []
