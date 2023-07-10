// Import required AWS SDK clients and commands for Node.js.
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./libs/s3Client.js";
import { createReadStream, createWriteStream } from "fs";
import { createGzip } from "zlib";
const BUCKET = process.env.BUCKET;
import Walk from "@root/walk";
import path from "path";
const VERSION = process.env.VERSION;
const component = `forms-flow-web@${VERSION}`;

const compressFileAndUpload = (fileName, filePath) => {
  const stream = createReadStream(`${filePath}/${fileName}`);
  stream
    .pipe(createGzip())
    .pipe(createWriteStream(`${filePath}/forms-flow-web.gz.js`))
    .on("finish", () => {
      console.log(`Successfully compressed the file at ${filePath}`);
      upload(
        `forms-flow-web.gz.js`,
        `${filePath}/forms-flow-web.gz.js`
      );
    });
};

const run = async (params) => {
  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new PutObjectCommand(params));
    console.log(
        "Successfully created " +
        params.Key +
        " and uploaded it to " +
        params.Bucket +
        "/" +
        params.Key
    );
    return results; // For unit tests.
  } catch (err) {
    console.log("Error", err);
    throw Error("Upload failed!");
  }
};

/**
 *
 * @param {string} file_name - artifact name
 * @param {string} file - artifact path
 * @param {string} type - artifact content type
 * @param {boolean} encode - is artifact encoded
 */
async function upload(file_name, file, type = "application/javascript", encode = true) {
    const params = {
        Bucket: BUCKET, 
        Key: `${component}/${file_name}`, 
        Body: createReadStream(file), 
        ContentType: type,
        ContentEncoding:"gzip"
      };
    if(!encode){
      delete params.ContentEncoding;
    }
    run(params);
    
}

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
          if (dirent.name === "forms-flow-web.js") {
            compressFileAndUpload(dirent.name, `${path.dirname(pathname)}`);
          }else if (path.dirname(pathname).includes("static")) {
            if (`${path.dirname(pathname).includes("js")}`) {
              upload(
                `${path.dirname(pathname).substring(9).replace(/\\/g, "/")}/${
                  dirent.name
                }`,
                `${path.dirname(pathname)}/${dirent.name}`,
                "application/javascript",
                false
              );
            } else {
              upload(
                `${path.dirname(pathname).substring(9).replace(/\\/g, "/")}/${
                  dirent.name
                }`,
                `${path.dirname(pathname)}/${dirent.name}`,
                "application/octet-stream",
                false
              );
            }
          }
    } catch (err) {
      console.log("Upload failed", err);
      throw err;
    }
  }
  return Promise.resolve();
}