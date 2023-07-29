"use strict";
/*

Config:
    - The port is for the server to be hosted on.
    - serverUrl should be the URL of the site running this. Or if you have like an ngrok tunnel like i have here in the example. Use that
    - The serverUrl/Server NEEDS to have a valid ssl certificate
    - path should be the absolute path to the projects root

I used an ngrok url in this example beacuse i needed a valid ssl to install the app.

*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: 5354,
    serverUrl: 'https://13ff-2a09-bac1-64e0-3d0-00-41-52.ngrok-free.app',
    path: '/Users/kevin/Desktop/SigningApi-v3/'
};
