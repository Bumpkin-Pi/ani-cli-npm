import chalk from "chalk";

const _prompt = require("simple-input");

async function selection(options:string[], extra_options:string[] = [], color1 = ((thing:string) => {return chalk.yellow(thing)}), color2 = ((thing:string) => {return chalk.green(thing)})){
    /*
    selection(options, extra_options, color1, color2)

    Gives use prompt to choose from a list of options. Either by inputting a number ranging from 1, to the length of the list. Or by inputting a letter (non-caps-sensitive) relating to the option.


     - options: array of options; e.g. ["play", "download", "continue", "quit"] REQUIRED


     - extra_options: array of characters as alternatives to numbers (both will be displayed). e.g. ["p", "d", "c", "q"].

       default: []

     - color1 and color2: functions that will dictate what 2 colors the options with alternate between (option1 will be color1, option2;color2, option3;color1, etc).
     recommended for this function to return a chalk.____() parsed string.

       default: ((thing:string) => {return chalk.yellow(thing)}) and ((thing:string) => {return chalk.green(thing)})
    */

    let color:boolean = true;
    for (let x in options){
        if (color){
            console.log(
                color1((parseInt(x)+1).toString()+
                    ((extra_options[x] == undefined)? "" : "/"+extra_options[x])+
                    ") "+options[x])
            )
        }else{
            console.log(
                color2((parseInt(x)+1).toString()+
                    ((extra_options[x] == undefined)? "" : "/"+extra_options[x])+
                    ") "+options[x])
            )
        }
        color = !color
    }
    let input:string = ""
    do{
        // @ts-ignore
        input = (await _prompt(">")).toLowerCase()
        for (let x in extra_options){
            if (extra_options[x].toLowerCase() == input){
                input = (parseInt(x)+1).toString()
            }
        }
        if (!(1 <= parseInt(input) && parseInt(input) <= options.length)){
            console.log(chalk.red("Invalid choice."))
        }
    }while(!(1 <= parseInt(input) && parseInt(input) <= options.length))
    return parseInt(input)-1
}

async function input(){
    return await _prompt(">")
}

async function number_input(max:number, min:number=1){
    let selector:string;
    let selection:number;
    do{
        selector = await _prompt(">")
        selection = parseInt(selector)
        if (selector == ""){
            selection = min
        }
        if (!(min <= selection && selection <= max)){
            console.log(chalk.red("Invalid choice."))
        }
    }while (!(min <= selection && selection <= max))

    return selection
}



export {selection, input, number_input}