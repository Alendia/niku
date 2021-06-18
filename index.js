const axios = require("axios").default;
const HttpsProxyAgent = require("https-proxy-agent");
const [targetLanguage, queryString] = process.argv.slice(2);

let result = [];

function getUrl(tl, qry, tk) {
  const url = `https://translate.google.com/translate_a/single?client=webapp&sl=auto&tl=${tl}&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&ssel=0&tsel=0&kc=1&tk=${tk}&q=${qry}`;
  return url;
}

function getResult(result, resp) {
  result[0] = "";
  for (const x of resp[0]) {
    if (x[0]) {
      result[0] += x[0];
    }
  }
}

function getSynonym(result, resp, queryString) {
  result[1] = "";
  if (resp[1]) {
    result[1] = result[1].concat("\n=========\n", `0_0: Translations of ${queryString}\n`);
    for (const x of resp[1]) {
      result[1] += `# ${x[0][0]}.\n`;
      for (const y of x[2]) {
        result[1] += `${y[0]}: ${y[1].join(", ")}\n`;
      }
    }
  }
}

function getSynonymEn(result, resp, queryString) {
  result[2] = "".concat("\n=========\n", `0_0: Synonyms of ${queryString}\n`);
  for (const x of resp[11]) {
    result[2] += `# ${x[0]}.\n`;
    for (const y of x[1]) {
      result[2] += `${y[0].join(", ")}` + "\n";
    }
  }
}

function getDefinition(result, resp, queryString) {
  result[3] = "".concat("\n=========\n", `0_0: Definitions of ${queryString}\n`);
  for (const x of resp[12]) {
    result[3] += `# ${x[0] || ""}.\n`;
    for (const y of x[1]) {
      result[3] = result[3].concat(`  - ${y[0]}\n`, `${y.length >= 3 ? `    * ${y[2]}\n` : ""}`);
    }
  }
}

function getExamples(result, resp, queryString) {
  result[4] = "".concat("\n=========\n", `0_0: Examples of ${queryString}\n`);
  for (const x of resp[13][0]) {
    result[4] += `  * ${x[0]}\n`;
  }
}

function getResp(url) {
  return axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0" },
    httpsAgent: new HttpsProxyAgent("http://localhost:7890"),
  });
}

function resultToHtml(result) {
  const css = `<style type="text/css">
  p {white-space: pre-wrap;}
  pos {color: #0000FF;}
  example {color: #008080;}
  gray {color: #606060;}
  </style>`;
  result = result.join("");
  // 词性
  result = result.replace(/(#.*)/gi, "<pos><b>$1</b></pos>");
  // 例子
  result = result.replace(/([*].*)/gi, "<example>$1</example>");
  result = result.replace(/(0_0:.*?of)(.*)/gi, "<gray>$1</gray>$2");
  result = result.replace(/(^_^:\sTranslate)(.*)(To)(.*)/giu, "<gray>$1</gray>$2<gray>$3</gray>$4");
  let html = `<html>\n<head>\n${css}\n</head>\n<body>\n<p>${result}</p></body>\n</html>`;
  console.log(html);
}

async function getTranslation(targetLanguage, queryString) {
  const tk = calculateToken(queryString);
  const url = getUrl(targetLanguage, queryString, tk);
  try {
    const resp = await getResp(url);
    getResult(result, resp.data);
    getSynonym(result, resp.data, queryString);

    if (resp.data[11]) {
      getSynonymEn(result, resp.data, queryString);
    }

    if (resp.data[12]) {
      getDefinition(result, resp.data, queryString);
    }

    if (resp.data[13]) {
      getExamples(result, resp.data, queryString);
    }
    resultToHtml(result);
  } catch (error) {
    console.log(error);
  }
}

function Main() {
  getTranslation(targetLanguage, queryString);
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
