export type LooseQueryResult = { data: unknown; error: unknown };

export type LooseQuery = PromiseLike<LooseQueryResult> & {
  select(columns?: string): LooseQuery;
  eq(column: string, value: unknown): LooseQuery;
  order(column: string, options?: { ascending?: boolean }): LooseQuery;
  insert(values: unknown): LooseQuery;
  update(values: unknown): LooseQuery;
  upsert(values: unknown): LooseQuery;
  delete(): LooseQuery;
  single(): Promise<LooseQueryResult>;
  maybeSingle(): Promise<LooseQueryResult>;
};

export type LooseSupabaseClient = { from(name: string): LooseQuery };
