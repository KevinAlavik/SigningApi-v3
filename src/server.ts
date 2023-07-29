import express, { Request, Response } from 'express';
import { sign } from './sign';
import { v4 as uuidv4 } from 'uuid';
import { download, deleteFile, createFile, genPlist } from './ulitilities';
import { config } from './config';
import * as fs from 'fs';

const app = express();
const port = config.port;

app.get('/', async (req: Request, res: Response) => {
    const uuid = uuidv4();

    const ipaUrl = req.query.ipa as string;
    const p12Url = req.query.p12 as string;
    const mpUrl = req.query.mp as string;
    const pass = req.query.pass as string;

    // Create WriteStream instances for output files
    const ipaFileStream = fs.createWriteStream(`out/unsigned/${uuid}.ipa`);
    const p12FileStream = fs.createWriteStream(`out/cert/${uuid}.p12`);
    const mpFileStream = fs.createWriteStream(`out/cert/${uuid}.mobileprovision`);

    // Wait for the file downloads to complete
    await download(ipaUrl, ipaFileStream);
    await download(p12Url, p12FileStream);
    await download(mpUrl, mpFileStream);

    // Introduce a 0.1-second delay before signing
    await new Promise((resolve) => setTimeout(resolve, 100)); // 100 milliseconds = 0.1 seconds

    // Sign Process
    let out = await sign(
        `./out/unsigned/${uuid}.ipa`,
        `./out/cert/${uuid}.p12`,
        `./out/cert/${uuid}.mobileprovision`,
        pass,
        uuid
    );

    // Function to remove ANSI escape codes and HTML tags from the string
    const removeEscapeCharacters = (str: any) =>
        str.replace(/\x1b\[[0-9;]*[mK]/g, '').replace(/<\/?[^>]+(>|$)/g, '');

    // Modify the output string to remove escape characters
    out = removeEscapeCharacters(out);

    let plistContent = genPlist(out)

    createFile(`./out/signed/${uuid}.plist`, plistContent)

    res.send(`<meta http-equiv="refresh" content="0;URL=itms-services://?action=download-manifest&url=${config.serverUrl}:${config.port}/out/signed/${uuid}.plist">`);

    try {
        await new Promise((resolve) => setTimeout(resolve, 50000));
        await deleteFile(`out/signed/${uuid}.ipa`);
        await deleteFile(`out/signed/${uuid}.plist`);
        await deleteFile(`out/unsigned/${uuid}.ipa`);
        await deleteFile(`out/cert/${uuid}.p12`);
        await deleteFile(`out/cert/${uuid}.mobileprovision`);
        console.log('Files deleted after processing.');
    } catch (error) {
        console.error('Error deleting files:', error);
    }
});

app.all('/*', (req, res) => {
    const filePath = `${config.path}${req.path}`; // Construct the file path

    // Send the file to the client
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).send('File not found.');
        }
    });
});

export function startServer() {
    console.log("Starting API server...")
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}