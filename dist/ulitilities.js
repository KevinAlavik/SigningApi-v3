"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genPlist = exports.createFile = exports.deleteFile = exports.download = void 0;
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
const config_1 = require("./config");
function download(url, output) {
    const protocolModule = url.startsWith('https') ? https : http;
    protocolModule.get(url, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Failed to download from ${url}. Status code: ${response.statusCode}`);
            response.resume(); // Consume the response data to free up memory.
            return;
        }
        response.pipe(output);
        output.on('finish', () => {
            console.log(`Download from ${url} complete.`);
        });
    }).on('error', (error) => {
        console.error(`Error downloading from ${url}: ${error.message}`);
    });
}
exports.download = download;
function deleteFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (error) {
                reject(error);
            }
            else {
                console.log(`File ${filePath} deleted.`);
                resolve();
            }
        });
    });
}
exports.deleteFile = deleteFile;
function createFile(filePath, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (error) => {
            if (error) {
                reject(error);
            }
            else {
                console.log(`File ${filePath} created.`);
                resolve();
            }
        });
    });
}
exports.createFile = createFile;
function genPlist(out) {
    const appNameRegex = />>> AppName:\s+(\S+)/;
    const bundleIdRegex = />>> BundleId:\s+(\S+)/;
    const bundleVerRegex = />>> BundleVer:\s+(\S+)/;
    const signedIpaRegex = />>> Archiving:\s+(\S+)/;
    const appNameMatch = out.match(appNameRegex);
    const bundleIdMatch = out.match(bundleIdRegex);
    const bundleVerMatch = out.match(bundleVerRegex);
    const signedIpaMatch = out.match(signedIpaRegex);
    const appName = appNameMatch ? appNameMatch[1] : '';
    const bundleId = bundleIdMatch ? bundleIdMatch[1] : '';
    const bundleVersion = bundleVerMatch ? bundleVerMatch[1] : '';
    const signedIpaPath = signedIpaMatch ? signedIpaMatch[1] : '';
    const plist = `
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
        <key>items</key>
        <array>
        <dict>
            <key>assets</key>
            <array>
            <dict>
                <key>kind</key>
                <string>software-package</string>
                <key>url</key> <string>${config_1.config.serverUrl}:${config_1.config.port}/${signedIpaPath.replace(config_1.config.path, '')}</string>
            </dict>
            </array>
            <key>metadata</key>
            <dict>
            <key>bundle-identifier</key>
            <string>${bundleId}</string>
            <key>bundle-version</key>
            <string>${bundleVersion}</string>
            <key>kind</key>
            <string>software</string>
            <key>title</key>
            <string>${appName}</string>
            </dict>
        </dict>
        </array>
    </dict>
    </plist>
    `;
    return plist;
}
exports.genPlist = genPlist;
