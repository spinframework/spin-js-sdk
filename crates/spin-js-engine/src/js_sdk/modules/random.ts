declare var _random: {
    math_rand: () => number
    get_rand: () => number
}

Math.random = function () {
    return _random.math_rand();
}