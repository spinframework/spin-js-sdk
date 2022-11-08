declare var _random: {
    get_rand: () => number
}

Math.random = function () {
    return _random.get_rand();
}