import * as fs from "fs"
//import chalk from 'chalk';

import {config_interface} from "../core_utils/interfaces";

function make_config_dir(cache_dir:string, debug:boolean){
    try{
        if (!fs.existsSync(cache_dir+"/")) fs.mkdirSync(cache_dir+"/");
    }catch{
        if (debug){
            console.log("Failed to make cache dir")
        }
    }
}

function write_config(cache_dir:string, config:config_interface){
    try{
        //make_config_dir(cache_dir, config.debug_mode)
        fs.writeFileSync(cache_dir+"/config.conf", JSON.stringify(config), "utf-8")
    }catch{
        console.log(("Failed to write to config file."))
    }
}

function load_config(cache_dir: string){
    let config: config_interface = {
        player: "BROWSER",
        proxy: "",
        user_agent: "Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/100.0",
        most_recent: {
            episode_number: 0,
            episode_second: 0,
            anime_id: ""
        },
        download_folder: ".",
        debug_mode: false,
        mpv_socket_path: "",
        vlc_socket: 0,
        vlc_pass: "",
        w2g_api_key: "",
        show_cover:false
    }
    if (fs.existsSync(cache_dir+"/config.conf")){
        // @ts-ignore
        let tmp = JSON.parse(fs.readFileSync(cache_dir+"/config.conf"), "utf8")

        // @ts-ignore
        if (tmp.player !== undefined) config.player = tmp.player;
        // @ts-ignore
        if (tmp.proxy !== undefined) config.proxy = tmp.proxy;
        // @ts-ignore
        if (tmp.user_agent !== undefined) config.user_agent = tmp.user_agent;
        // @ts-ignore
        if (tmp.most_recent !== undefined) {
            // @ts-ignore
            if (tmp.most_recent.episode_number !== undefined) config.most_recent.episode_number = tmp.most_recent.episode_number;
            // @ts-ignore
            if (tmp.most_recent.anime_id !== undefined) config.most_recent.anime_id = tmp.most_recent.anime_id;
            // @ts-ignore
            if (tmp.most_recent.episode_second !== undefined) config.most_recent.episode_second = tmp.most_recent.episode_second;
        }
        // @ts-ignore
        if (tmp.download_folder !== undefined) config.download_folder = tmp.download_folder;
        // @ts-ignore
        if (tmp.mpv_socket_path !== undefined) config.mpv_socket_path = tmp.mpv_socket_path;
        // @ts-ignore
        if (tmp.vlc_socket !== undefined) config.vlc_socket = tmp.vlc_socket;
        // @ts-ignore
        if (tmp.vlc_pass !== undefined) config.vlc_pass = tmp.vlc_pass;
        // @ts-ignore
        if (tmp.w2g_api_key !== undefined) config.w2g_api_key = tmp.w2g_api_key;
    }

    write_config(cache_dir, config)

    return config
}

export {load_config, write_config, make_config_dir}
