class Response {
    constructor({ message, data = null, statusCode }) {
        this.success = statusCode >= 200 && statusCode < 300;
        this.message = message;
        if (data) this.data = data;
        this.statusCode = statusCode;
    }

    send(res) {
        return res.status(this.statusCode).json(this);
    }
}

class SuccessResponse extends Response {
    constructor({ message, data, statusCode = 200 }) {
        super({ message, data, statusCode });
    }
}

class ErrorResponse extends Response {
    constructor({ message, statusCode = 500, errors = null }) {
        super({ message, statusCode });
        if (errors) this.errors = errors;
    }
}

module.exports = {
    Response,
    SuccessResponse,
    ErrorResponse,
};
