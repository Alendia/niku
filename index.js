const [targetLanguage, keyword] = process.argv.slice(2);

function calculateToken(text) {
  let [firstSeed, secondSeed] = [440498, 1287591069];

  const d = Buffer.from(text, "utf8");

  let a = firstSeed;
  for (const value of d) {
    a += value;
    a = workToken(a, "+-a^+6");
  }

  a = workToken(a, "+-3^+b+-f");
  a ^= secondSeed;

  if (0 > a) {
    a = (a & 2147483647) + 2147483648;
  }

  a %= 1e6;
  a = parseInt(a);

  return `${a}.${a ^ parseInt(firstSeed)}`;
}

function workToken(firstSeed, seed) {
  for (let i = 0; i < seed.length - 2; i += 3) {
    let char = seed.charAt[i + 2];
    let d = parseInt(char, 16);

    if (seed.charAt[i + 1] === "+") {
      d = firstSeed >>> d;
    } else {
      d = firstSeed << d;
    }

    if (seed.charAt[i] == "+") {
      firstSeed = firstSeed + d >> 0;
    } else {
      firstSeed ^= d;
    }
  }

  return firstSeed;
}
