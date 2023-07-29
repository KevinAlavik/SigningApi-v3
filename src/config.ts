/*

Config:
    - The port is for the server to be hosted on.
    - serverUrl should be the URL of the site running this. Or if you have like an ngrok tunnel like i have here in the example. Use that
    - The serverUrl/Server NEEDS to have a valid ssl certificate
    - path should be the absolute path to the projects root

I used an ngrok url in this example beacuse i needed a valid ssl to install the app.
If serverUrl is on another port then 80/443  then you need to set it like: "https://yourDomain.com:port". The config.port is for the main server to be ran on.

The serverUrl is the url where the api is at (say if you have connected your server to a domain) and the port dont affect that url.

Learn how to set up the API using apache in src/SETUP.md#Apache
*/

export const config = {
    port: 5354,
    serverUrl: 'https://13ff-2a09-bac1-64e0-3d0-00-41-52.ngrok-free.app',
    path: '/Users/kevin/Desktop/SigningApi-v3/'
}