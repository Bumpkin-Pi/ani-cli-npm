import {curl} from "./curl";
import {RegexParse} from "./regex";
import {generate_link} from "./generate_link";
import {config_interface} from "./interfaces";
import {search_cache, new_cache} from "./cache";
import {selection} from "./input";
import {write_config} from "./load_config";
const open = require("open")
const PlayerController = require("media-player-controller")
const dl = require("download-file-with-progressbar");
const chalk = require("chalk")

class Anime{
    /*
    Class for handling a show/film

    Stores anime dpage links assigned with anime_id.

    Initialised with Anime.init()

     */

    id: string = ""
    episode_list: string[] = []
    player:any = 0;

    async init(anime_id: string, cache_folder:string){ // init mate
        /*
        Initiate Anime object

        Will first search cache folder for cache file (this will contain id and dpage links)

        If no cache is found, it will use get_ep_bases(anime_id) to get links. (Webscrapes from animixplay.to), then creates cache

        anime_id:
         */
        let cache_object = search_cache(cache_folder, anime_id)
        console.log(cache_object)
        this.id = anime_id
        if (cache_object == 0){
            await this.get_ep_bases(this.id)
            new_cache(cache_folder,this)
        }else{
            try{
                this.episode_list = cache_object.episode_list
            }catch{
                await this.get_ep_bases(this.id)
            }
        }
        return 0;
    }

    async get_episode_link(episode:number, player:string = "VLC"){
        let episode_dpage = this.episode_list[episode]
        let id = episode_dpage.replace("//gogohd.net/streaming.php?id=","")
        id = id.slice(0, id.indexOf("="))
        let link:string = await generate_link(1,id, player)
        if (!link){
            link = await generate_link(2,id, player)
        }
        if (!link){
            console.log(chalk.red("Failed to generate links"))
        }
        if (player == "VLC" && link.includes("m3u8")){
            console.log(chalk.red("Warning; VLC is not compatible with m3u8 playlist files without custom plugins."))
        }
        return link
    }

    async get_ep_bases(anime_id:string){
        /*
        Scrapes animixplay.to for dpage links.
        returns array with all dpage links
         */
        let html = (await(curl("https://animixplay.to/v1/"+anime_id))).split("\n") //POTENTIAL BREAK POINT. animixplay.to may change domain address
        let lines = ""
        for (let x in html){
            if(RegexParse(html[x], "*<div id=\"epslistplace\"*")){
                lines = (html[x])
            }
        }
        lines = lines.slice(55, lines.length).replace("}</div>", "")
        lines = "{" + lines.slice(lines.indexOf(",")+1, lines.length) + "}"
        let json = JSON.parse(lines)
        for (const value of Object.entries(json) as unknown as string[]) {
            this.episode_list.push(value[1])
        }
    }

    async play_head(episode:number, config:config_interface, config_dir:string){
        /*
        # Starts play cascade.

        ## Takes in:
        ### Episode number, counding from 0
        ### Config object
        ### Config save directory

         - If config.player is set to MPV or VLC, it will use the media-player-controller package.

         - If set to Browser, it will use the "open" packer.

         - If set to Link, it will simply print the media stream link to console, primarily for debuting peruses.
         */
        console.clear()
        console.log(`Playing ${this.id} episode ${episode+1}`)
        switch (config.player){
            case "MPV":
                console.log(("Opening MPV.."))
                this.player = await new PlayerController({
                    app: 'mpv',
                    args: ['--fullscreen'],
                    media: await this.get_episode_link(episode, config.player)
                });
                // @ts-ignore
                await this.player.launch(err => {
                    if (err) return console.error(err.message);
                });
                break
            case "VLC":
                console.log(("Opening VLC.."))

                this.player = await new PlayerController({
                    app: 'vlc',
                    args: ['--fullscreen'],
                    media: await this.get_episode_link(episode, config.player)
                });
                // @ts-ignore
                await this.player.launch(err => {
                    if (err) return console.error(err.message);
                });
                break
            case "BROWSER":
                console.log(("Opening browser..."))
                await open(await this.get_episode_link(episode, config.player))
                break
            case "LINK":
                this.player = 1;
                console.log(await this.get_episode_link(episode, config.player))
                break
        }
        config.most_recent.anime_id = this.id
        config.most_recent.episode_number = episode
        write_config(config_dir, config)

        if (episode <= 0){
            switch(await selection([
                "Next",
                "Quit"
            ], ["n", "q"])){
                case 0:
                    await this.play(episode+1, config, config_dir)
                    break
                case 1:
                    break
            }
        }else if(episode >= this.episode_list.length-1){
            switch(await selection([
                "Previous",
                "Quit"
            ], ["p", "q"])){
                case 0:
                    await this.play(episode-1, config, config_dir)
                    break
                case 1:
                    break
            }
        }else{
            switch(await selection([
                "Next",
                "Previous",
                "Quit"
            ], ["n", "p", "q"])){
                case 0:
                    await this.play(episode+1, config, config_dir)
                    break
                case 1:
                    await this.play(episode-1, config, config_dir)
                    break
                case 2:
                    break
            }
        }

    }

    async play(episode:number, config:config_interface, config_dir:string){
        /*
        # Continues play cascade
        ## Continues on from play_head()
         */
        console.clear()
        console.log(`Playing ${this.id} episode ${episode+1}`)
        if (this.player == 0){
            await open(await this.get_episode_link(episode, "BROWSER"))
        }else if(this.player == 1){
            console.log(await this.get_episode_link(episode))
        } else if (this.player.opts.app == "mpv"){
            await this.player.load(await this.get_episode_link(episode))
        }else{
            this.player.quit()
            this.player = await new PlayerController({
                app: 'vlc',
                args: ['--fullscreen'],
                media: await this.get_episode_link(episode, config.player)
            });
            // @ts-ignore
            await this.player.launch(err => {
                if (err) return console.error(err.message);
            });
        }
        config.most_recent.anime_id = this.id
        config.most_recent.episode_number = episode
        write_config(config_dir, config)


        if (episode <= 0){
            switch(await selection([
                "Next",
                "Quit"
            ], ["n", "q"])){
                case 0:
                    await this.play(episode+1, config, config_dir)
                    break
                case 1:
                    break
            }
        }else if(episode >= this.episode_list.length-1){
            switch(await selection([
                "Previous",
                "Quit"
            ], ["p", "q"])){
                case 0:
                    await this.play(episode-1, config, config_dir)
                    break
                case 1:
                    break
            }
        }else{
            switch(await selection([
                "Next",
                "Previous",
                "Quit"
            ], ["n", "p", "q"])){
                case 0:
                    await this.play(episode+1, config, config_dir)
                    break
                case 1:
                    await this.play(episode-1, config, config_dir)
                    break
                case 2:
                    break
            }
        }
    }

    async download(episode:number, download_folder:string){ //TODO fix last progress bar appearing after selection.
        /*
        ## Downloads an episode (counting from 0) to download_folder, with progress bar.
         */
        // @ts-ignore
        let ep_link:string = await this.get_episode_link(episode)
        let file_name = `${this.id}-${episode+1}.mp4`
        if (ep_link.includes(".m3u8")) console.log(chalk.red("Warning: Animixplay will download an m3u8 file. This will require some extra steps to play. It is advised to use a 3rd party website or tool to download these from the link."));
        // @ts-ignore
        let option = {
            filename: ep_link.includes("m3u8") ? file_name.replace("mp4", "m3u8") : file_name,
            dir: download_folder,
            // @ts-ignore
            onDone: (info)=>{
                // @ts-ignore
                console.log(chalk.green(`\n -- Download finished -- \nLocation: ${info.path}. Size: ${Math.round(info.size/100000)*10} Bytes\n`)+">");
                return 0;
            },
            // @ts-ignore
            onError: (err) => {
                console.log(chalk.red('error', err));
            },
            // @ts-ignore
            onProgress: (curr, total) => {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write("\x1b[32m -- "+(curr / total * 100).toFixed(2)+"% "+"#". repeat(Math.ceil((curr / total)*((process.stdout.columns-20)/1.5)))+"~".repeat(Math.ceil(((process.stdout.columns-20)/1.5) - (curr / total)*((process.stdout.columns-20)/1.5)))+" -- \x1b[0m")
        }}
        //console.log((`${option.dir}/${option.filename}`))

        return await dl(ep_link, option);
    }

}

export {Anime}