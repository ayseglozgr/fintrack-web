/** Backend'in tüm endpoint'lerde döndüğü standart yanıt zarfı. */
export interface ServiceResponse<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
  errors: string[];
}
