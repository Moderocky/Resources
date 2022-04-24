import {dom} from "../lib/dom.mjs";

export const profile = (user, account) => dom.create(`
        <div class="w-full h-full p-2 transition-opacity">
            <div class="select-none cursor-pointer p-1 h-full rounded-xl group sm:flex space-x-2 bg-slate-900 shadow-xl">
                <img src="{avatar_url}" alt="Resource icon" loading="lazy" width="300" height="300" class="h-16 w-56 sm:h-full w-full sm:w-4/12 object-cover object-top rounded-lg transition duration-500 group-hover:scale-90"/>
                <div class="w-8/12 p-5 h-full">
                    <div class="space-y-2 flex flex-col h-full">
                        <h4 class="text-2xl font-semibold text-gray-100">{icon}{display_name}</h4>
                        <div class="h-min">
                        ` + (account.roles.includes('admin') ? `
                        <span class="uppercase text-sm bg-fuchsia-400 rounded-md scale-90 px-1 w-min">admin</span>
                        ` : '') + (account.roles.includes('contributor') ? `
                        <span class="uppercase text-sm bg-emerald-400 rounded-md scale-90 px-1 w-min">contributor</span>
                        ` : '') + (account.roles.includes('staff') ? `
                        <span class="uppercase text-sm bg-indigo-400 rounded-md scale-90 px-1 w-min">staff</span>
                        ` : '') + (account.roles.includes('donor') ? `
                        <span class="uppercase text-sm bg-amber-400 rounded-md scale-90 px-1 w-min">donor</span>
                        ` : '') + `
                        </div>
                        <p class="text-gray-200">{bio}</p>
                        <div class="text-gray-300">
                            ` + (user.company != null ? `<h3><i class="fa-solid fa-briefcase w-5"></i> ` + user.company + `</h3>` : '') + `
                            ` + (user.twitter_username != null ? `<h3><i class="fa-brands fa-twitter w-5"></i> ` + user.twitter_username + `</h3>` : '') + `
                            ` + (user.location != null ? `<h3><i class="fa-solid fa-map-location-dot w-5"></i> ` + user.location + `</h3>` : '') + `
                            ` + (user.blog != null ? `<h3><i class="fa-solid fa-desktop w-5"></i> ` + user.blog + `</h3>` : '') + `
                        </div>
                    </div>
                </div>
            </div>
        </div>`,
    {
        ...user,
        ...account,
        icon: (account.admin
            ? `<i class="fa-solid fa-screwdriver-wrench text-violet-400 mr-2"></i> `
            : '')
    }
);
