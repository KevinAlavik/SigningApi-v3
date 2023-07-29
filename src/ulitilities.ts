import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { config } from './config';

export function download(url: string, output: fs.WriteStream) {
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

export function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log(`File ${filePath} deleted.`);
                resolve();
            }
        });
    });
}

export function createFile(filePath: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, content, (error) => {
            if (error) {
                reject(error);
            } else {
                console.log(`File ${filePath} created.`);
                resolve();
            }
        });
    });
}

export function genPlist(out: any) {
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
                <key>url</key> <string>${config.serverUrl}:${config.port}/${signedIpaPath.replace(config.path, '')}</string>
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
