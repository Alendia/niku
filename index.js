const axios = require("axios").default;
const HttpsProxyAgent = require("https-proxy-agent");
const [targetLanguage, queryString] = process.argv.slice(2);

let result = "";

function getUrl(tl, qry, tk) {
  const url = `https://translate.google.com/translate_a/single?client=webapp&sl=auto&tl=${tl}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&ssel=0&tsel=0&kc=1&tk=${tk}&q=${qry}`;
  return url;
}

function getSynonym(result, resp, queryString) {
  if (resp[1]) {
    result = result.concat("\n=========\n", `0_0: Translations of ${queryString}\n`);
    for (const x of resp[1]) {
      result += `# ${x[0][0]}.\n`;
      for (const y of x[2]) {
        console.log("getSynonym:", y[1]);
        // result += `${y[0]}: ${", ".concat(y[1])}\n`;
      }
    }
  }
  return result;
}

function getResult(result, resp) {
  for (const x of resp[0]) {
    if (x[0]) {
      result += x[0];
    }
  }
  return result + "\n";
}

function getDefinition(result, resp, queryString) {
  result = result.concat("\n=========\n", `0_0: Definitions of ${queryString}\n`);
  for (const x of resp[12]) {
    result += `# ${x[0] || ""}.\n`;
    for (const y of x[1]) {
      result = result.concat(`  - ${y[0]}\n`, `${y.length >= 3 ? `    * ${y[2]}\n` : ""}`);
    }
  }
  return result;
}

function getExamples(result, resp, queryString) {
  result = result.concat("\n=========\n", `0_0: Examples of ${queryString}\n`);
  for (const x of resp[13][0]) {
    result += `  * ${x[0]}\n`;
  }
  return result;
}

function getSynonymEn(result, resp, queryString) {
  result = result.concat("\n=========\n", `0_0: Synonyms of ${queryString}\n`);
  for (const x of resp[11]) {
    result += `# ${x[0]}.\n`;
    for (const y of x[1]) {
      console.log("getSynonymEn:", y);
      // result += `", ".concat`
    }
  }
}

function getResp(url) {
  return axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0" },
    httpsAgent: new HttpsProxyAgent("http://localhost:7890"),
  });
}

async function getTranslation(targetLanguage, queryString) {
  const tk = calculateToken(queryString);
  const url = getUrl(targetLanguage, queryString, tk);
  try {
    const resp = await getResp(url);
    console.log(resp.data);
    getResult(result, resp.data);
    getSynonym(result, resp.data, queryString);

  } catch (error) {
    console.log(error);
  }
}

function Main() {
  console.log(getTranslation(targetLanguage, queryString));
}

Main();

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
    let char = seed[i + 2];
    let d = parseInt(char, 16);
 
    if (seed[i + 1] === "+") {
      d = firstSeed >>> d;
    } else {
      d = firstSeed << d;
    }

    if (seed[i] === "+") {
      firstSeed = (firstSeed + d) >> 0;
    } else {
      firstSeed ^= d;
    }
  }

  return firstSeed;
}
