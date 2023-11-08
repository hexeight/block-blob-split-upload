const core = require('@actions/core');
const github = require('@actions/github');

try {
  
  const separator = core.getInput('separator');
  console.log(`Splitting files with separator (${separator})!`);

  const fileFilter = core.getInput('fileFilter');
  console.log(`Filtering files for splitting based on (${fileFilter})!`);
  
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
