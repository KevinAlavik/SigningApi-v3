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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const sign_1 = require("./sign");
const uuid_1 = require("uuid");
const ulitilities_1 = require("./ulitilities");
const config_1 = require("./config");
const fs = __importStar(require("fs"));
const app = (0, express_1.default)();
const port = config_1.config.port;
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = (0, uuid_1.v4)();
    const ipaUrl = req.query.ipa;
    const p12Url = req.query.p12;
    const mpUrl = req.query.mp;
    const pass = req.query.pass;
    // Create WriteStream instances for output files
    const ipaFileStream = fs.createWriteStream(`out/unsigned/${uuid}.ipa`);
    const p12FileStream = fs.createWriteStream(`out/cert/${uuid}.p12`);
    const mpFileStream = fs.createWriteStream(`out/cert/${uuid}.mobileprovision`);
    // Wait for the file downloads to complete
    yield (0, ulitilities_1.download)(ipaUrl, ipaFileStream);
    yield (0, ulitilities_1.download)(p12Url, p12FileStream);
    yield (0, ulitilities_1.download)(mpUrl, mpFileStream);
    // Introduce a 0.1-second delay before signing
    yield new Promise((resolve) => setTimeout(resolve, 100)); // 100 milliseconds = 0.1 seconds
    // Sign Process
    let out = yield (0, sign_1.sign)(`./out/unsigned/${uuid}.ipa`, `./out/cert/${uuid}.p12`, `./out/cert/${uuid}.mobileprovision`, pass, uuid);
    // Function to remove ANSI escape codes and HTML tags from the string
    const removeEscapeCharacters = (str) => str.replace(/\x1b\[[0-9;]*[mK]/g, '').replace(/<\/?[^>]+(>|$)/g, '');
    // Modify the output string to remove escape characters
    out = removeEscapeCharacters(out);
    let plistContent = (0, ulitilities_1.genPlist)(out);
    (0, ulitilities_1.createFile)(`./out/signed/${uuid}.plist`, plistContent);
    res.send(`<meta http-equiv="refresh" content="0;URL=itms-services://?action=download-manifest&url=${config_1.config.serverUrl}:${config_1.config.port}/out/signed/${uuid}.plist">`);
    try {
        yield new Promise((resolve) => setTimeout(resolve, 50000));
        yield (0, ulitilities_1.deleteFile)(`out/signed/${uuid}.ipa`);
        yield (0, ulitilities_1.deleteFile)(`out/signed/${uuid}.plist`);
        yield (0, ulitilities_1.deleteFile)(`out/unsigned/${uuid}.ipa`);
        yield (0, ulitilities_1.deleteFile)(`out/cert/${uuid}.p12`);
        yield (0, ulitilities_1.deleteFile)(`out/cert/${uuid}.mobileprovision`);
        console.log('Files deleted after processing.');
    }
    catch (error) {
        console.error('Error deleting files:', error);
    }
}));
app.all('/*', (req, res) => {
    const filePath = `${config_1.config.path}${req.path}`; // Construct the file path
    // Send the file to the client
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).send('File not found.');
        }
    });
});
function startServer() {
    console.log("Starting API server...");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
exports.startServer = startServer;
