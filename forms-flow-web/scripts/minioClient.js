/* eslint-disable no-unused-vars */
require("dotenv").config();

const { createReadStream, createWriteStream } = require("fs");
const { createGzip } = require("zlib");

const Minio = require("minio");
const pjson = require(`../package.json`);
const path = require("path");
const Walk = require("@root/walk");

// Instantiate the minio client with the endpoint
// and access keys as shown below.

const minioClient = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
  port: Number(process.env.S3_PORT),
  useSSL: process.env.NODE_ENV === "production",
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_KEY,
});

const metaData = {
  "Content-Type": "application/javascript",
  "Content-Encoding": "gzip",
};

/**
 *
 * @param {string} file_name - artifact name
 * @param {string} file - artifact path
 */
function upload(file_name, file, meta) {
  minioClient.fPutObject(
    process.env.S3_BUCKET_NAME,
    `forms-flow-web/${pjson.version}/${file_name}`,
    file,
    meta,
    function (err, etag) {
      if (err) {
        // Fail CD if upload fails
        throw err;
      }
      console.log(`${file_name}  uploaded successfully.`);
    }
  );
}

const compressFileAndUpload = (fileName, filePath) => {
  const stream = createReadStream(`${filePath}/${fileName}`);
  stream
    .pipe(createGzip())
    .pipe(createWriteStream(`${filePath}/single-spa-build.gz.js`))
    .on("finish", () => {
      console.log(`Successfully compressed the file at ${filePath}`);
      upload(
        "single-spa-build.gz.js",
        `${filePath}/single-spa-build.gz.js`,
        metaData
      );
    });
};

Walk.walk(`../build`, walkFunc)
  .then(function () {
    console.log("Collected all artifacts to upload");
  })
  .catch(function (reason) {
    console.log("Failed to collect the artifacts", reason);
  });

// walkFunc must be async, or return a Promise
function walkFunc(err, pathname, dirent) {
  if (err) {
    // throw an error to stop walking
    // (or return to ignore and keep going)
    console.warn("fs stat error for %s: %s", pathname, err.message);
    return Promise.resolve();
  }

  // return false to skip a directory
  // (ex: skipping "dot file" directories)
  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }

  if (dirent.isFile()) {
    try {
      console.log(
        `Collecting artifact -> ${path.dirname(pathname)}/${dirent.name}`
      );
      if (dirent.name === "single-spa-build.js") {
        compressFileAndUpload(dirent.name, `${path.dirname(pathname)}`);
      } else if (path.dirname(pathname).includes("static")) {
        if (`${path.dirname(pathname).includes("js")}`) {
          upload(
            `${path.dirname(pathname).substring(9).replace(/\\/g, "/")}/${
              dirent.name
            }`,
            `${path.dirname(pathname)}/${dirent.name}`,
            { "Content-Type": "application/javascript" }
          );
        } else {
          upload(
            `${path.dirname(pathname).substring(9).replace(/\\/g, "/")}/${
              dirent.name
            }`,
            `${path.dirname(pathname)}/${dirent.name}`,
            { "Content-Type": "application/octet-stream" }
          );
        }
      }
    } catch (err) {
      console.log("Upload failed", err);
    }
  }
  return Promise.resolve();
}
