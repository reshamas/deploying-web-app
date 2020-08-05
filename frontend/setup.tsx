const fs = require('fs');
const yaml = require('js-yaml');

console.log("Converting Config yaml to json")

const config = yaml.safeLoad(fs.readFileSync('../config.yaml', 'utf8'));


let data = JSON.stringify({config: config});
fs.writeFileSync('src/config.json', data);

