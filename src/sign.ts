import { exec } from 'child_process';

const execCommand = (command: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error.message}`);
                reject(error.message);
            } else if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            } else {
                console.log(`${stdout}`);
                resolve(stdout);
            }
        });
    });
};

export async function sign(ipa: string, p12: string, mp: string, pass: string, uuid: string) {

    try {
        let out = await execCommand(
            `zsign ${ipa} -k ${p12} -m ${mp} -p ${pass} -o out/signed/${uuid}.ipa`
        );
        return out;
    } catch (error) {
        return error;
    }
}
