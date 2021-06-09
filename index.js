const [targetLanguage, keyword] = process.args.slice(2);

function calculateToken(text) {
  const [firstSeed, secondSeed] = [440498, 1287591069];

  const d = Buffer.from(text, "utf8");

  for (const value in d) {
    firstSeed += value;
    firstSeed = workToken(firstSeed, "+-a^+6");
  }

  firstSeed = workToken(firstSeed, "+-3^+b+-f");
  firstSeed ^= secondSeed;

  if (0 > firstSeed) {
    firstSeed = (firstSeed & 2147483647) + 2147483648;
  }

  firstSeed %= 1e6;
  firstSeed = parseInt(firstSeed);

  let tmpChar = (firstSeed ^ parseInt(firstSeed)).toString();
  return firstSeed.toString() + "." + tmpChar;
}

function workToken(firstSeed, seed) {
  for (let i = 0; i < seed.length - 2; i += 3) {
    let char = seed.charAt[i + 2];
    let tmpChar = parseInt(char[0], 16);
    let d;

    if (tmpChar >= parseInt("a", 16)) {
      d = parseInt(char[0], 16);
    }

    if (seed.charAt[i + 1] === "+") {
      d = firstSeed >>> b;
    } else {
      d = firstSeed << b;
    }

    if (seed.charAt[i] == "+") {
      firstSeed += d;
    } else {
      firstSeed ^= d;
    }
  }

  return firstSeed;
}
