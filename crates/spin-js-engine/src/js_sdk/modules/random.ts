/** @internal */
declare var _random: {
    math_rand: () => number
    get_rand: () => number
}

/** @internal */
Math.random = function () {
    return _random.math_rand();
}