# Mutation Testing Demo (fizzbuzz)

เดโมเปรียบเทียบ **test coverage** กับ **mutation testing** ด้วยเกม fizzbuzz ตามบทความ
[A demonstration of Mutation Testing](https://gerg.dev/2019/09/mutation-testing-demo/)
โดย Gregory Paciga (repo ต้นฉบับ: `github.com/gpaciga/mutation-testing-demo`)

## Mutation testing คืออะไร

Coverage บอกแค่ว่า "โค้ดถูกเรียกใช้" แต่ไม่บอกว่า "เทสจับบั๊กได้จริงไหม"
ส่วน mutation testing จะแกล้งใส่บั๊ก (เรียกว่า **mutant**) ลงในโค้ด แล้วรันเทสซ้ำ:

- เทส**ล้ม** = **killed** (ดี — เทสจับบั๊กได้)
- เทส**ผ่าน** = **survived** (แย่ — เทสจับบั๊กไม่ได้)

## กติกา fizzbuzz

- นับเลขเริ่มจาก 1
- หาร 3 ลงตัว พูดว่า `fizz`
- หาร 5 ลงตัว พูดว่า `buzz`
- หารทั้ง 3 และ 5 ลงตัว พูดว่า `fizzbuzz`

## โครงไฟล์

```
src/fizzbuzz.js       โค้ดเกม (ตั้งใจใส่บั๊ก: 'fooz' แทน 'fizz')
test/fizzbuzz.test.js เทสตั้งต้น (ตั้งใจเขียนแบบไม่มี expect)
stryker.conf.js       คอนฟิก Stryker (testRunner: jest, mutator: javascript)
```

## วิธีติดตั้ง

```sh
git clone https://github.com/gpaciga/mutation-testing-demo.git
cd mutation-testing-demo
npm i
```

> หมายเหตุจากเครื่องที่รันเดโมนี้ (Option A — ใช้ของเดิมยุค 2019):
>
> 1. `package-lock.json` ต้นฉบับมี URL ของ registry ภายในเก่าที่ตายแล้วปนอยู่
>    จึงลบแล้ว `npm i` ใหม่จาก public registry (เก็บไฟล์เดิมไว้เป็น
>    `package-lock.original.json`)
> 2. pin dependency ลูกกลับเป็นเวอร์ชันยุค 2019 (อยู่ใน range `^` เดิมพอดี):
>    `mutation-testing-report-schema@1.1.1` และ `mutation-testing-metrics@1.3.0`
>    เพราะเวอร์ชันใหม่ใช้ syntax ที่ Node เก่าอ่านไม่ได้

## วิธีรัน

รันเทส (ใช้ Node ปัจจุบันได้เลย):

```sh
npm run test
```

รัน mutation testing — **Stryker 2.x ต้องใช้ Node 10/12 เท่านั้น**
(บน Node ปัจจุบันจะพังด้วย `ERR_PACKAGE_PATH_NOT_EXPORTED`)
สลับเวอร์ชันด้วย `nvm` หรือ `fnm` ก่อน:

```sh
fnm use 12        # หรือ: nvm use 12
npx stryker run
```

รีพอร์ต coverage ดูที่ `coverage/lcov-report/index.html`
รีพอร์ต mutation ดูที่ `reports/mutation/html/index.html`

## ขั้นตอนเดโม + ผลลัพธ์

### รอบที่ 1 — baseline: coverage 100% แต่ mutation 0 คะแนน

รัน `npm run test` → เทสผ่าน 2/2, coverage 100% ทุกช่อง (ดู log เต็มข้อ 1)
รัน `npx stryker run` → เกิด 14 mutants, **killed 0 / survived 14, score 0.00**
(ดู log เต็มข้อ 2 — รวมถึง mutant `result += 'fooz'` → `result += ""` ที่รอดมาได้)

### รอบที่ 2 — เติม assertion: เทสแดงทั้งที่ coverage ยัง 100%

แก้เทสจาก `fizzbuzz(15);` เฉย ๆ เป็น:

```js
expect(fizzbuzz(15)).toEqual("fizzbuzz");
```

รัน `npm run test` → **ล้ม 1/2**: `Expected: "fizzbuzz", Received: "foozbuzz"`
แต่ coverage ยัง 100% เหมือนเดิม (ดู log เต็มข้อ 3) — นี่คือประเด็นของบทความ

### รอบที่ 3 — แก้บั๊ก + รัน mutation ซ้ำ

แก้ `result += 'fooz'` → `result += 'fizz'` แล้ว `npm run test` → ผ่าน 2/2 (ดู log เต็มข้อ 4)
รัน `npx stryker run` อีกครั้ง → **killed 12 / survived 2, score 85.71**
(ดู log เต็มข้อ 5)

### สรุปเปรียบเทียบ

| รอบ         | Coverage | Mutation score | Killed / Survived |
|-------------|----------|----------------|-------------------|
| ก่อนแก้     | 100%     | 0.00           | 0 / 14            |
| หลังแก้     | 100%     | 85.71          | 12 / 2            |

2 ตัวที่ยังรอดคือ mutant `if (number % 3 === 0)` → `if (true)`
และ `if (number % 5 === 0)` → `if (true)` — แปลว่าเทสยังไม่มีเคสที่เงื่อนไขเป็น
false (บล็อกต้นฉบับทิ้งไว้เป็น exercise ให้ไปเขียนเทสเพิ่มเอง)

## ปัญหาที่เจอ (ใช้ของเดิมปี 2019 บนเครื่องปัจจุบัน)

1. `package-lock.json` ต้นฉบับชี้ไป registry ภายในที่ตายแล้ว → ลงใหม่จาก public registry
2. Stryker 2.x รันบน Node 24 ไม่ได้ → รันเทสด้วย Node ปัจจุบัน, รัน Stryker ด้วย Node 12
3. dependency ลูกถูก resolve เป็นเวอร์ชันใหม่ที่ใช้ syntax สมัยใหม่ → pin กลับเป็นเวอร์ชันปี 2019

---

## ภาคผนวก: log เต็มจากเครื่องที่รัน

> หมายเหตุ: ตัด escape code สี, แก้พาธเต็มเป็น relative path (`src/fizzbuzz.js`)
> และตัดบรรทัด warning ซ้ำซ้อนของ PowerShell ออก ที่เหลือคือ output จริงทั้งหมด

### 1. `npm run test` — baseline (ผ่าน, coverage 100%)

```
> mutation-testing-demo@1.0.0 test
> jest --verbose --testPathIgnorePatterns stryker-tmp

PASS test/fizzbuzz.test.js
  Fizzbuzz
    ✓ gets fizzbuzz (1ms)
    ✓ not fizzbuzz

-------------|----------|----------|----------|----------|-------------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------|----------|----------|----------|----------|-------------------|
All files    |      100 |      100 |      100 |      100 |                   |
 fizzbuzz.js |      100 |      100 |      100 |      100 |                   |
-------------|----------|----------|----------|----------|-------------------|
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        1.496s, estimated 10s
Ran all test suites.
```

### 2. `npx stryker run` — baseline (14 survived, score 0.00)

```
09:32:21 INFO ConfigReader Using stryker.conf.js in the current working directory.
09:32:22 INFO BroadcastReporter Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter
09:32:22 INFO InputFileResolver Found 1 of 9 file(s) to be mutated.
09:32:22 INFO InitialTestExecutor Starting initial test run. This may take a while.
09:32:25 INFO InitialTestExecutor Initial test run succeeded. Ran 2 tests in 3 seconds (net 2 ms, overhead 2653 ms).
09:32:25 INFO MutatorFacade 14 Mutant(s) generated
09:32:25 INFO SandboxPool Creating 8 test runners (based on CPU count)

0. [Survived] BlockStatement
src/fizzbuzz.js:0:26
-   function fizzbuzz(number) {

-       var result = '';

-       if (number % 3 === 0) {

-           result += 'fooz'

-       }

-       if (number % 5 === 0) {

-           result += 'buzz'

-       }

-       return result;

-   }
+   function fizzbuzz(number) {}

Ran all tests for this mutant.
1. [Survived] StringLiteral
src/fizzbuzz.js:1:17
-       var result = '';
+       var result = "Stryker was here!";

Ran all tests for this mutant.
2. [Survived] ConditionalExpression
src/fizzbuzz.js:2:8
-       if (number % 3 === 0) {
+       if (true) {

Ran all tests for this mutant.
3. [Survived] ConditionalExpression
src/fizzbuzz.js:2:8
-       if (number % 3 === 0) {
+       if (false) {

Ran all tests for this mutant.
4. [Survived] ConditionalExpression
src/fizzbuzz.js:5:8
-       if (number % 5 === 0) {
+       if (false) {

Ran all tests for this mutant.
5. [Survived] ConditionalExpression
src/fizzbuzz.js:5:8
-       if (number % 5 === 0) {
+       if (true) {

Ran all tests for this mutant.
6. [Survived] EqualityOperator
src/fizzbuzz.js:2:8
-       if (number % 3 === 0) {
+       if (number % 3 !== 0) {

Ran all tests for this mutant.
7. [Survived] ArithmeticOperator
src/fizzbuzz.js:2:8
-       if (number % 3 === 0) {
+       if (number * 3 === 0) {

Ran all tests for this mutant.
8. [Survived] EqualityOperator
src/fizzbuzz.js:5:8
-       if (number % 5 === 0) {
+       if (number % 5 !== 0) {

Ran all tests for this mutant.
9. [Survived] ArithmeticOperator
src/fizzbuzz.js:5:8
-       if (number % 5 === 0) {
+       if (number * 5 === 0) {

Ran all tests for this mutant.
10. [Survived] StringLiteral
src/fizzbuzz.js:6:18
-           result += 'buzz'
+           result += ""

Ran all tests for this mutant.
11. [Survived] BlockStatement
src/fizzbuzz.js:5:26
-       if (number % 5 === 0) {

-           result += 'buzz'

-       }
+       if (number % 5 === 0) {}

Ran all tests for this mutant.
12. [Survived] BlockStatement
src/fizzbuzz.js:2:26
-       if (number % 3 === 0) {

-           result += 'fooz'

-       }
+       if (number % 3 === 0) {}

Ran all tests for this mutant.
13. [Survived] StringLiteral
src/fizzbuzz.js:3:18
-           result += 'fooz'
+           result += ""

Ran all tests for this mutant.
Ran 2.00 tests per mutant on average.
-------------|---------|----------|-----------|------------|----------|---------|
File         | % score | # killed | # timeout | # survived | # no cov | # error |
-------------|---------|----------|-----------|------------|----------|---------|
All files    |    0.00 |        0 |         0 |         14 |        0 |       0 |
 fizzbuzz.js |    0.00 |        0 |         0 |         14 |        0 |       0 |
-------------|---------|----------|-----------|------------|----------|---------|
09:32:34 INFO HtmlReporter Your report can be found at: reports/mutation/html/index.html
09:32:34 INFO Stryker Done in 12 seconds.
```

### 3. `npm run test` — หลังเติม assertion (ล้ม 1 ข้อ)

```
> mutation-testing-demo@1.0.0 test
> jest --verbose --testPathIgnorePatterns stryker-tmp

FAIL test/fizzbuzz.test.js
  Fizzbuzz
    ✕ gets fizzbuzz (4ms)
    ✓ not fizzbuzz (1ms)

  ● Fizzbuzz › gets fizzbuzz

    expect(received).toEqual(expected) // deep equality

    Expected: "fizzbuzz"
    Received: "foozbuzz"

      at Object.<anonymous> (test/fizzbuzz.test.js:5:30)

-------------|----------|----------|----------|----------|-------------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------|----------|----------|----------|----------|-------------------|
All files    |      100 |      100 |      100 |      100 |                   |
 fizzbuzz.js |      100 |      100 |      100 |      100 |                   |
-------------|----------|----------|----------|----------|-------------------|
Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        1.693s
Ran all test suites.
```

### 4. `npm run test` — หลังแก้ `fooz` → `fizz` (ผ่าน)

```
> mutation-testing-demo@1.0.0 test
> jest --verbose --testPathIgnorePatterns stryker-tmp

PASS test/fizzbuzz.test.js
  Fizzbuzz
    ✓ gets fizzbuzz (2ms)
    ✓ not fizzbuzz

-------------|----------|----------|----------|----------|-------------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------|----------|----------|----------|----------|-------------------|
All files    |      100 |      100 |      100 |      100 |                   |
 fizzbuzz.js |      100 |      100 |      100 |      100 |                   |
-------------|----------|----------|----------|----------|-------------------|
Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        2.136s
Ran all test suites.
```

### 5. `npx stryker run` — หลังแก้ (12 killed / 2 survived, score 85.71)

```
09:33:24 INFO ConfigReader Using stryker.conf.js in the current working directory.
09:33:25 INFO BroadcastReporter Detected that current console does not support the "progress" reporter, downgrading to "progress-append-only" reporter
09:33:25 INFO InputFileResolver Found 1 of 13 file(s) to be mutated.
09:33:25 INFO InitialTestExecutor Starting initial test run. This may take a while.
09:33:29 INFO InitialTestExecutor Initial test run succeeded. Ran 2 tests in 4 seconds (net 3 ms, overhead 3223 ms).
09:33:29 INFO MutatorFacade 14 Mutant(s) generated
09:33:29 INFO SandboxPool Creating 8 test runners (based on CPU count)
Mutation testing 85% (elapsed: <1m, remaining: <1m) 12/14 tested (2 survived, 0 timed out)

2. [Survived] ConditionalExpression
src/fizzbuzz.js:2:8
-       if (number % 3 === 0) {
+       if (true) {

Ran all tests for this mutant.
4. [Survived] ConditionalExpression
src/fizzbuzz.js:5:8
-       if (number % 5 === 0) {
+       if (true) {

Ran all tests for this mutant.
Ran 2.00 tests per mutant on average.
-------------|---------|----------|-----------|------------|----------|---------|
File         | % score | # killed | # timeout | # survived | # no cov | # error |
-------------|---------|----------|-----------|------------|----------|---------|
All files    |   85.71 |       12 |         0 |          2 |        0 |       0 |
 fizzbuzz.js |   85.71 |       12 |         0 |          2 |        0 |       0 |
-------------|---------|----------|-----------|------------|----------|---------|
09:33:39 INFO HtmlReporter Your report can be found at: reports/mutation/html/index.html
09:33:39 INFO Stryker Done in 14 seconds.
```
