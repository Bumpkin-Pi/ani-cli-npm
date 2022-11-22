#! /usr/bin/env node

const {emitWarning} = process;

process.emitWarning = (warning, ...args) => {
    if (args[0] === 'ExperimentalWarning') {
        return;
    }

    if (args[0] && typeof args[0] === 'object' && args[0].type === 'ExperimentalWarning') {
        return;
    }

    return emitWarning(warning, ...args);
};
const fetch = require('node-fetch');
const PlayerController = require("media-player-controller")
const open = require("open")
const prompt = require("simple-input");
const getAppDataPath = require("appdata-path")
const fs = require("fs")

let config = {
    player: "BROWSER",
    proxy: "",
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/100.0'
}

try{
    config = JSON.parse(fs.readFileSync(getAppDataPath()+"/ani-cli-npm.conf")) //getAppDataPath()
}catch{
    fs.writeFileSync(getAppDataPath()+"/ani-cli-npm.conf", JSON.stringify(config))
}

const gogohd_url="https://gogohd.net/"
const base_url="https://animixplay.to"
const colors = {
    Black: "\x1b[30m%s\x1b[0m",
    Red: "\x1b[31m%s\x1b[0m",
    Green: "\x1b[32m%s\x1b[0m",
    Yellow: "\x1b[33m%s\x1b[0m",
    Blue: "\x1b[34m%s\x1b[0m",
    Magenta: "\x1b[35m%s\x1b[0m",
    Cyan: "\x1b[36m%s\x1b[0m",
    White: "\x1b[37m%s\x1b[0m"
}


//const HttpsProxyAgent = require('https-proxy-agent');
//let proxyAgent = new HttpsProxyAgent(config.proxy);


async function config_(temp){
    console.clear()
console.log(colors.Blue, "ANI-CLI-NPM \n")
    console.log(colors.Yellow, "Config:\n")
    console.log(colors.Cyan, `1) Player; ${temp.player}`)
    console.log(colors.Cyan, `2) Proxy; ${temp.proxy}`)
    console.log(colors.Cyan, `3) User agent; ${temp.user_agent}`)
    console.log(colors.Cyan, "4) Save and exit")
    console.log(colors.Cyan, "5) Exit without saving changes")
    let choice = parseInt(await input(""));
    switch (choice){
        case 1:
            console.log(colors.Cyan, `1) VLC (default)`)
            console.log(colors.Cyan, `2) Browser`)
            console.log(colors.Cyan, `3) MPV`)
            let player = parseInt(await input("New Player;"))
            switch (player){
                case 1:
                    temp.player = "VLC"
                    break
                case 2:
                    temp.player = "BROWSER"
                    break
                case 3:
                    temp.player = "MPV"
                    break
            }
            return temp,0
        case 2:
            temp.proxy = (await(input("New Proxy;"))).replaceAll(" ", "")
            return temp, 0
        case 3:
            temp.user_agent = await(input("New User agent;"))
            return temp, 0
        case 4:
            return temp, 1
        case 5:
            return temp, 2
    }
}

async function input(message){
    if (message){
        console.log(colors.Magenta,message)
    }
    return await prompt(">")
}

async function curl(url, method="GET", redirect = false){
    //try{
        let response = await fetch(url, {
            //"agent": proxyAgent,
            "headers": {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/100.0',
                "X-Requested-With": "XMLHttpRequest"
            },
            "referrerPolicy": "origin",
            "body": null,
            "method": method,
            "redirect": 'follow',
            "follow": 10,
        }).catch(async function(err) {
            console.warn(colors.Red, `Something went wrong connecting to ${url}.`);
            await search();
            process.exit()
        })
        if (redirect){
            return response.url
        }else{
            return await response.text()
        }
    /*}catch{
        console.log(colors.Red, "Something went wrong in curl()")
        await main()
    }*/

}

function matchRuleShort(str, rule) {
    let escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

async function search_anime(search){
    let filter = "*<ahref=\"/category/*\"title=\"*\">"
    let html = (await curl("https://gogoanime.dk//search.html?keyword="+search)).split("\n")
    let lines = []
    for (x in html){
        html[x] = html[x].replaceAll(/ /g,'').replaceAll(/\t/g,'')
        if (matchRuleShort(html[x], filter)){
            html[x] = html[x].slice(html[x].indexOf("/category/")+10);
            html[x] = html[x].slice(0, html[x].indexOf("\"title="));
            lines.push(html[x])
        }
    }
    if (!lines[0]){
        lines.pop()
    }


    return lines
}

async function episode_list(anime_id){
    let html = (await curl(base_url+"/v1/"+anime_id)).split("\n")
    let lines = ""

    for (let x in html){
        if(matchRuleShort(html[x], "*<div id=\"epslistplace\"*")){
            lines = (html[x])
        }
    }

    lines = lines.slice(55, lines.length).replace("}</div>", "")
    lines = "{" + lines.slice(lines.indexOf(",")+1, lines.length) + "}"
    lines = JSON.parse(lines)

    let json = []
    for (x in lines){
        json.push(lines[x])
    }
    return json
}

async function download(url, name){
    console.log(colors.Red, "Feature not implemented yet. Sorry for any inconvenience.\nIf you need to download a video, request the link, then download it via your internet browser of choice.")
}

async function selection(options, prompt, extra_options = []){
    let selection = 0
    while (true){
        selection = (await input(prompt))
        if ((selection <= options && selection >= 1) || extra_options.includes(selection)){
            break
        }
        console.log(colors.Red,`Please input a valid option.`)
    }
    return selection
}

async function process_search(query) {
    console.log(colors.Yellow, "Searching: "+query)

    let search_results = await search_anime(query)
    if (!search_results[0]) {
        console.log(colors.Red, "No results.")
        await main()
        process.exit()
    } else {
        for (x in search_results) {
            console.log(colors.Cyan,`${parseInt(x)+1})${" ".repeat(((search_results.length).toString().length+1)-((parseInt(x)+1).toString().length))}${search_results[x].replaceAll("-", " ")}`)
        }
    }

    let anime_id = search_results[await selection(search_results.length, "Please select an anime.")-1]
    let episodes = await episode_list(anime_id)
    let episode_number = 0;
    if (episodes.length > 1){
        episode_number = (await selection(episodes.length, `Please select an episode (1-${episodes.length}).`))-1
    }
    return {
        anime_id: anime_id,
        episodes: episodes,
        episode_number: episode_number
    }
}

async function get_video_link(episode_dpage){
    let id = episode_dpage.replace("//gogohd.net/streaming.php?id=","")
    id = id.slice(0, id.indexOf("="))
    let link = await generate_link(1,id)
    if (!link){
        link = await generate_link(2,id)
    }
    return link
}

async function generate_link(provider, id){
    let html = ""
    let provider_name = ""
    switch (provider) {
        case 1:
            html = await curl(`${gogohd_url}streaming.php?id=${id}`)
            provider_name = 'Xstreamcdn'
            console.log(colors.Yellow, `Fetching ${provider_name} links...`)
            html = html.split("\n")
            let fb_id = ""
            for (x in html){
                if (matchRuleShort(html[x], "*<li class=\"linkserver\" data-status=\"1\" data-video=\"https://fembed9hd.com/v/*")){
                    fb_id = html[x].slice(html[x].indexOf("/v/")+3, html[x].indexOf("\">X"))
                    break
                }
            }
            if (!fb_id){
                console.log("Error, no fb_id found.")
                return 0
            }

            //let refr = "https://fembed-hd.com/v/"+fb_id
            let post = await curl("https://fembed-hd.com/api/source/"+fb_id, "POST")
            post = post.slice(post.indexOf(",\"data\":[{\"file\":\"")+18, post.length)
            post = post.slice(0, post.indexOf("\"")).replaceAll("\\/","/")
            return post
        case 2:
            provider_name = 'Animixplay'
            let buffer = new Buffer(id)
            let enc_id = buffer.toString("base64")
            buffer = new Buffer(id+"LTXs3GrU8we9O"+enc_id)
            let ani_id = buffer.toString("base64")
            buffer = Buffer.from((await curl(`${base_url}/api/live${ani_id}`, "GET", true)).split("#")[1], "base64")
            if (config.player === "BROWSER"){
                return `${base_url}/api/live${ani_id}`
            }
                return buffer.toString("utf-8") //TODO m3u8 player

            
    }
}

async function post_play(link, anime, player="VLC"){
    while (true){
        console.log(colors.Yellow, `Playing episode ${anime.episode_number+1} of ${anime.anime_id.replaceAll("-", " ")}\n`)
        console.log(colors.Cyan, "1/l) Show Link")
        console.log(colors.Cyan, "2/n) Next Episode")
        console.log(colors.Cyan, "3/p) Prev Episode")
        console.log(colors.Cyan, "4/q) Quit")
        switch (await selection(4, "select;", ["l", "n", "p", "q"])){
            case "l":
            case "1":
                console.clear()
                console.log(colors.Blue, "ANI-CLI-NPM \n")
                console.log(colors.Yellow, "Link: "+link)
                break
            case "n":
            case "2":
                if (anime.episode_number > anime.episodes.length-2){
                    console.clear()
                    console.log(colors.Red, "Damn, all out of episodes?")
                    break
                }
                anime.episode_number += 1
                link = await get_video_link(anime.episodes[anime.episode_number])
                await play(link, anime, config.player)
                process.exit()
                break
            //EVEN MORE NEEDLESS QUIT STATEMENTS!!!!!!
            case "p":
            case "3":
                if (anime.episode_number < 2){
                    console.clear()
                    console.log(colors.Red, "Error; Episode 0 is only available for premium members")
                    break
                }
                anime.episode_number -= 1
                link = await get_video_link(anime.episodes[anime.episode_number])
                await play(link, anime, config.player)
                process.exit()
                break
            case "q":
            case "4":
                console.clear()
                await main()
                process.exit()
                break
        }
    }
}

async function play(link, anime, player="VLC"){
    console.clear()
    console.log(colors.Blue, "ANI-CLI-NPM \n")
    if (player === "VLC"){
        console.log(colors.Yellow, "Loading VLC... ")
        let player = new PlayerController({
            app: 'vlc',
            args: ['--fullscreen'],
            media: link
        });
        await player.launch(err => {
            if(err) return console.error(err.message);
        });
        await post_play(link, anime)
        process.exit()


    }else if (player === "BROWSER"){
        console.log(colors.Yellow, "Opening video in browser... ")
        open(link)
        await post_play(link, anime, player)
        process.exit()
    }else if (player === "MPV"){
        console.log(colors.Yellow, "Loading MPV... ")
        let player = new PlayerController({
            app: 'mpv',
            args: ['--fullscreen'],
            media: link
        });
        await player.launch(err => {
            if(err) return console.error(err.message);
        });
        await post_play(link, anime, player)
        process.exit()
    }
}

async function search(){
    console.clear()
    console.log(colors.Blue, "ANI-CLI-NPM \n")
    console.log(colors.Magenta, "Search...")
    let choice = await input("")
    let anime = await process_search(choice)

    console.log("\n")

    console.log(colors.Blue, "Indexing video...")
    let link = await get_video_link(anime.episodes[anime.episode_number])
    console.clear()
    console.log(colors.Blue, "ANI-CLI-NPM \n")
    if (!link){
        console.log(colors.Red, "Np link for this episode found?")
        console.log(colors.Yellow, "^ at current this is due to not all of the required video repos being implemented.")
        console.log(colors.Yellow, "Sorry for any inconvenience, this should soon by implemented. We appreciate your patience.")
        process.exit()
    }
    console.log(colors.Blue, `Episode ${anime.episode_number+1} of ${anime.anime_id.replaceAll("-", " ")} found.\n`)
    if (link.includes("animixplay.to") && config.player === "VLC"){
        console.log(colors.Red, "Warning; animix.to uses m3u8 playlists. Without custom plugins, VLC will not be able to play this file format. It is recomended to use another player for this show/film.")
    }
    console.log(colors.Cyan, "1/p) Play")
    console.log(colors.Cyan, "2/d) Download")
    console.log(colors.Cyan, "3/l) Show Link")
    console.log(colors.Cyan, "4/q) quit")
    choice = (await selection(4, "select;", "p", "d", "l", "q"))
    switch (choice){
        case "p":
        case "1":
            await play(link, anime, config.player)
            break
        case "d":
        case "2":
            download(link, anime.anime_id+anime.episode_number+".mp4")
            break
        case "l":
        case "3":
            console.log(colors.Yellow, "Link: "+link)
            break
        case "q":
        case "4":
            await main()
            process.exit()
    }
}



console.clear()
console.log(colors.Blue, "Welcome to Ani-Cli-npm")
async function main(){
    console.log(colors.Red, "Warning; if you do not have mpv video player installed, you will have to change your video player to either vlc or browser in config.\n")
    console.log(colors.Cyan, "1/s) Search")
    console.log(colors.Cyan, "2/c) config")
    console.log(colors.Cyan, "3/q) quit")
    let choice = await selection(3, "select;", ["s", "c", "q"])
    switch (choice){
        case "s":
        case "1":
            await search()
            break
        case "c":
        case "2":
            let temp = structuredClone(config);
            let exit_code;
            while (true) {
                temp, exit_code = await config_(temp)
                if (exit_code === 1) {
                    config = temp
                    //proxyAgent = new HttpsProxyAgent(config.proxy);
                    console.clear()
                    console.log(colors.Blue, "ANI-CLI-NPM \n")
                    console.log(colors.Yellow, "Config changed.")
                    break
                } else if (exit_code === 2) {
                    temp = config
                    console.clear()
                    console.log(colors.Blue, "ANI-CLI-NPM \n")
                    console.log(colors.Yellow, "Config changes disregarded.")
                    break
                }
            }
            try{
                fs.writeFileSync(getAppDataPath()+"/ani-cli-npm.conf", JSON.stringify(config))
            }catch{
                console.log(colors.Red, "Error writing to .conf file.")
            }
            await main()
            break
        case "q":
        case 3:
            console.log(colors.Black, "Exiting...")
            process.exit()
    }
}


main()

