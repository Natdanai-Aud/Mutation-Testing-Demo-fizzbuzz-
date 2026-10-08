var fizzbuzz = require('../src/fizzbuzz.js');

describe("Fizzbuzz", function() {
    it("gets fizzbuzz", function() {
        expect(fizzbuzz(15)).toEqual("fizzbuzz");
    });

    it("not fizzbuzz", function() {
        fizzbuzz(8);
    });
});
