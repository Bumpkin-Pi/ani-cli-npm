const chalk = require("chalk")
import {selection, input} from "./input";
import {config_interface} from "./interfaces";

const configs = [ // List of functions, add function for extra config options.
    (async (temp: config_interface)=> {
        temp.player = [
            "VLC",
            "BROWSER",
            "MPV",
            "W2G",
            "LINK",
        ][await selection([
            "VLC      - VLC media player",
            "Browser  - Play in default browser",
            "MPV      - MPV media player",
            "w2g.tv   - Watch together with friends in browser (Specify api token to create rooms linked to your account)",
            "Link     - Simply display the link in console"
        ], [], ((item) => {return chalk.cyan(item)}), ((item) => {return chalk.cyan(item)}))];
        // @ts-ignore
        return temp,0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New Proxy;"))
        temp.proxy = (await(input())).replaceAll(" ", "")
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New User Agent"))
        temp.user_agent = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New Downloads Folder"))
        temp.download_folder = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New socket file"))
        temp.mpv_socket_path = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New VLC socket"))
        temp.vlc_socket = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New VLC password"))
        temp.vlc_pass = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        console.log(chalk.cyan("New w2g.tv api token"))
        temp.w2g_api_key = await(input())
        // @ts-ignore
        return temp, 0
    }),
    (async (temp: config_interface) => {
        // @ts-ignore
        return temp, 1
    }),
    (async (temp: config_interface) => {
        // @ts-ignore
        return temp, 2
    })
]


async function config_(temp:config_interface){
    /*
    ## Lets user change a single attribute of config. Returns new config object, and an exit code

    ### 0 to continue (generic return)
    ### 1 To confirm  (Save and exit)
    ### 2 to cancel   (exit without saving changes)
     */
    console.clear()
    console.log(chalk.blue("ANI-CLI-NPM \n"))
    console.log(chalk.yellow("Config:\n"))

    return configs[await selection([
            "Player; "+temp.player,
            "Proxy; "+temp.proxy,
            "User agent; "+temp.user_agent,
            "Downloads folder; "+temp.download_folder,
            "Mpv socket connection file; "+temp.mpv_socket_path,
            "VLC socket; "+temp.vlc_socket,
            "VLC pass; "+temp.vlc_pass,
            "W2G api token: "+temp.w2g_api_key,
            "Save and exit",
            "Exit without saving"
        ], [], ((item) => {return chalk.cyan(item)}), ((item) => {return chalk.cyan(item)}))
        ](temp)
}

export {config_}