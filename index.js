const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
  
  const separator = core.getInput('separator');
  console.log(`Splitting files with separator (${separator})!`);

  const fileFilter = core.getInput('fileFilter');
  console.log(`Filtering files for splitting based on (${fileFilter})!`);
  let splitExtensions = fileFilter.split(',');
  
  // Get all files in the static artifact
  let path = "./";
  let list = fs.readdirSync(path, {
    withFileTypes: true,
    recursive: true
  }).filter(function (file) {
    return fs.statSync(file.path+'/'+file.name).isFile();
  });

  // Log al the files being uploaded
  console.log("Scanning folder...");
  for (var i = 0; i < list.length; i++){
    console.log(list[i]);
  }

  // Initialize Azure Blob Connection
  const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

  // Enter your storage account name and shared key
  const account = core.getInput('storageAccountName');
  const accountKey = core.getInput('storageAccountKey');
  const containerName = core.getInput('containerName');

  const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // Upload each file to blob storage
  console.log("Starting upload");
  for (var i = 0; i < list.length; i++){
    let filePath = list[i].path+'/'+list[i].name;
    console.log("Uploading", filePath);
    
    // Check if extenstion matches filter criteria for blob split
    let ext = list[i].name.toLocaleLowerCase().split('.');
    ext = ext[ext.length - 1];
    if(splitExtensions.includes(ext))
    {
      console.log("Splitting ", filePath, "into blocks before uploading.");
      let content = fs.readFileSync(filePath, {encoding: "utf-8"});
      let splitContent = content.split(separator);
      console.log("Split into ", splitContent.length, "blocks.")
    }

    // Upload block blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
