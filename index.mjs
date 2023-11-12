import core from '@actions/core'
import github from '@actions/github'
import fs from 'fs'
import crypto from 'crypto'
import mime from 'mime-types'

import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

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
  console.log("Connecting to Azure Storage Account...");

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
  console.log("Connected to Azure Storage Account");
  const createContainerResponse = await containerClient.createIfNotExists();

  console.log(`Created container ${containerName} successfully`, createContainerResponse.requestId);

  // Upload each file to blob storage
  console.log("Starting upload");
  for (var i = 0; i < list.length; i++){
    let filePath = list[i].path;
    if (filePath[filePath.length - 1] != '/')
      filePath += '/';
    filePath += list[i].name;
    console.log("Uploading", filePath);
    
    // Check if extenstion matches filter criteria for blob split
    let ext = list[i].name.toLocaleLowerCase().split('.');
    ext = ext[ext.length - 1];
    let mimeType = mime.lookup(ext);
    if (!mimeType)
      mimeType = "application/octet-stream";
    console.log("File mime-type identified to", mimeType);
    if(splitExtensions.includes(ext))
    {
      console.log("Splitting ", filePath, "into blocks before uploading.");
      let content = fs.readFileSync(filePath, {encoding: "utf-8"});
      let splitContent = content.split(separator);
      console.log("Split into ", splitContent.length, "blocks.")

      const blockBlobClient = containerClient.getBlockBlobClient(filePath);

      // Stage blocks
      let blockIds = [];
      for (var c = 0; c < splitContent.length; c++) {
        let content = splitContent[c];
        console.log("Content length", content.length);
        let buff = crypto.randomBytes(64);
        let blockId = buff.toString('base64');
        console.log("Setting block id", blockId);
        let blockIdResp = await blockBlobClient.stageBlock(blockId, content, content.length);
        console.log("Block response");
        console.log(blockIdResp);

        // add blockId to array for block commit
        blockIds.push(blockId);
      }

      // Commit blocks into block blob
      console.log("Blocks", blockIds);
      let blockResp = await blockBlobClient.commitBlockList(blockIds, {
        blobHTTPHeaders: {
          blobContentType: mimeType
        }
      });
      console.log(blockResp);
    }
    else
    {
      // Upload block blob
      console.log(`Uploading ${filePath} without splitting...`);
      const blockBlobClient = containerClient.getBlockBlobClient(filePath);
      await blockBlobClient.uploadFile(filePath, {
        blobHTTPHeaders: {
          blobContentType: mimeType
        }
      });
      console.log(`Upload complete for ${filePath}`);
    }
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
