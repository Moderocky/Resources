import {dom} from "../lib/dom.mjs";
import {http} from "../lib/request.mjs";


export async function chart(user) {
    let data = await http.getRaw('https://resources.byteskript.org/activity_graph/' + user.login + '.svg', {}, {}, 'no-cors').then(response => response.text());
    console.log(data);
    data = data.replaceAll('#EEEEEE', 'rgba(210,210,210,0.5)');
    data = data.replaceAll('#FFEE4A', 'rgba(150,140,204,0.5)');
    data = data.replaceAll('#FFC501', 'rgba(155,120,206,0.5)');
    data = data.replaceAll('#FE9600', 'rgba(150,111,220,0.5)');
    data = data.replaceAll('#03001C', 'rgba(207,53,241,0.5)');
    data = data.replaceAll('#767676', 'rgba(210,210,210,0.9)');
    return dom.create(`<div class="w-full h-auto">` + data + `</div>`);
}
