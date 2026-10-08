function fizzbuzz(number) {
    var result = '';
    if (number % 3 === 0) {
        result += 'fizz'
    }
    if (number % 5 === 0) {
        result += 'buzz'
    }
    return result;
}

module.exports = fizzbuzz;
