"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = void 0;
const child_process_1 = require("child_process");
const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error.message}`);
                reject(error.message);
            }
            else if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            }
            else {
                console.log(`${stdout}`);
                resolve(stdout);
            }
        });
    });
};
function sign(ipa, p12, mp, pass, uuid) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let out = yield execCommand(`zsign ${ipa} -k ${p12} -m ${mp} -p ${pass} -o out/signed/${uuid}.ipa`);
            return out;
        }
        catch (error) {
            return error;
        }
    });
}
exports.sign = sign;
