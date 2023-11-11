/******/ var __webpack_modules__ = ({

/***/ 767:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __nccwpck_require__) => {

__nccwpck_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
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
  console.log("Connecting to Azure Storage Account...");
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
  console.log("Connected to Azure Storage Account");
  const createContainerResponse = await containerClient.createIfNotExists();

  console.log(`Created container ${containerName} successfully`, createContainerResponse.requestId);

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

      const blockBlobClient = containerClient.getBlockBlobClient(filePath);

      // Stage blocks
      //splitContent.forEach(c => {
      //  let blockId = 
      //  blockBlobClient.stageBlock(blockId, body);
      //});
      //containerClient.stageBlock();

      // Commit blocks into block blob
    }
    else
    {
      // Upload block blob
      console.log(`Uploading ${filePath} without splitting...`);
      const blockBlobClient = containerClient.getBlockBlobClient(filePath);
      blockBlobClient.uploadFile(filePath).then(function (res){
        console.log("File upload result for ", filePath);
        console.log(res);
      })
      .catch(function (err) {
        console.error("Error uploading", filePath);
        console.error(err);
      });
    }
  }

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/async module */
/******/ (() => {
/******/ 	var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 	var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 	var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 	var resolveQueue = (queue) => {
/******/ 		if(queue && !queue.d) {
/******/ 			queue.d = 1;
/******/ 			queue.forEach((fn) => (fn.r--));
/******/ 			queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 		}
/******/ 	}
/******/ 	var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 		if(dep !== null && typeof dep === "object") {
/******/ 			if(dep[webpackQueues]) return dep;
/******/ 			if(dep.then) {
/******/ 				var queue = [];
/******/ 				queue.d = 0;
/******/ 				dep.then((r) => {
/******/ 					obj[webpackExports] = r;
/******/ 					resolveQueue(queue);
/******/ 				}, (e) => {
/******/ 					obj[webpackError] = e;
/******/ 					resolveQueue(queue);
/******/ 				});
/******/ 				var obj = {};
/******/ 				obj[webpackQueues] = (fn) => (fn(queue));
/******/ 				return obj;
/******/ 			}
/******/ 		}
/******/ 		var ret = {};
/******/ 		ret[webpackQueues] = x => {};
/******/ 		ret[webpackExports] = dep;
/******/ 		return ret;
/******/ 	}));
/******/ 	__nccwpck_require__.a = (module, body, hasAwait) => {
/******/ 		var queue;
/******/ 		hasAwait && ((queue = []).d = 1);
/******/ 		var depQueues = new Set();
/******/ 		var exports = module.exports;
/******/ 		var currentDeps;
/******/ 		var outerResolve;
/******/ 		var reject;
/******/ 		var promise = new Promise((resolve, rej) => {
/******/ 			reject = rej;
/******/ 			outerResolve = resolve;
/******/ 		});
/******/ 		promise[webpackExports] = exports;
/******/ 		promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 		module.exports = promise;
/******/ 		body((deps) => {
/******/ 			currentDeps = wrapDeps(deps);
/******/ 			var fn;
/******/ 			var getResult = () => (currentDeps.map((d) => {
/******/ 				if(d[webpackError]) throw d[webpackError];
/******/ 				return d[webpackExports];
/******/ 			}))
/******/ 			var promise = new Promise((resolve) => {
/******/ 				fn = () => (resolve(getResult));
/******/ 				fn.r = 0;
/******/ 				var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 				currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 			});
/******/ 			return fn.r ? promise : getResult();
/******/ 		}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 		queue && (queue.d = 0);
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module used 'module' so it can't be inlined
/******/ var __webpack_exports__ = __nccwpck_require__(767);
/******/ __webpack_exports__ = await __webpack_exports__;
/******/ 
