/// this middleware adds a correlationId to the request object
const withCorrelationId = (request) => {
    request.correlationId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// export all middlewares as an object
export { withCorrelationId }
