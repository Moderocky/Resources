import {dom} from "../lib/dom.mjs";
import {account} from "../lib/login.mjs";
let login = dom.create(`<button type="button" aria-label="Log in" class="group h-12 px-6 border-2 border-gray-600 dark:border-gray-300 rounded-full transition duration-300
 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100">
                <p class="relative flex items-center space-x-4 justify-center text-lg text-gray-700 dark:text-gray-300 transition duration-300 group-hover:text-blue-600">
                    <i class="fa-brands fa-github"></i> <span class="block w-max font-semibold tracking-wide sm:text-base">Log In</span>
                </p>
            </button>`);

account.isLoggedIn().then(async (result) => {
    if (!result) login.onclick = () => account.login(true);
    else {
        const user = await account.getUser()
        login.onclick = () => window.location.href = '/user';
        login.replaceChildren(dom.create(`<p class="relative flex items-center space-x-4 justify-center text-lg text-gray-700 dark:text-gray-300 transition duration-300 group-hover:text-blue-600">
                    <img alt="Avatar" class="w-6 h-6 rounded-xl" src="{avatar_url}"> <span class="block w-max font-semibold tracking-wide sm:text-base">{display_name}</span>
                </p>`, {...user}));
    }
})

export {login};
