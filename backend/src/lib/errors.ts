


export class HttpError extends Error {
    status:number;
    details?:unknown;

    constructor(status:number,message:string,details?:unknown){
        super(message);
        this.status = status;
        // this.message = message;
        this.details = details;
    }
}

export class NotfoundError extends HttpError{
    constructor(message="Not found"){
        super(404,message);
    }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}