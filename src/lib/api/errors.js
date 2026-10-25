export class ApiError extends Error {
    status;
    kind;
    data;
    constructor(message, status = 500, kind, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.kind = kind;
        this.data = data;
    }
}
