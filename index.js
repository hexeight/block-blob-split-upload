const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
  
  const separator = core.getInput('separator');
  console.log(`Splitting files with separator (${separator})!`);

  const fileFilter = core.getInput('fileFilter');
  console.log(`Filtering files for splitting based on (${fileFilter})!`);
  
  let path = "./";
  let list = fs.readdirSync(path, {
    withFileTypes: true,
    recursive: true
  }).filter(function (file) {
    return fs.statSync(file.path+'/'+file.name).isFile();
  });

  console.log("Scanning folder...");
  for (var i = 0; i < list.length; i++){
    console.log(list[i]);
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
