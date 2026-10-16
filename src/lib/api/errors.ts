export class ApiError extends Error {
  status: number;
  kind?: string;
  data?: any;

  constructor(message: string, status: number = 500, kind?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
    this.data = data;
  }
}
