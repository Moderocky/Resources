import {dom} from "../lib/dom.mjs";
export const card = (user) => dom.create(`
        <div class="w-full md:w-6/12 lg:w-4/12 xl:w-3/12 p-2 opacity-0 transition-opacity">
            <div aria-label="{full_name}" 
                onclick="window.location.href = '/users?id={id}'" 
                class="select-none cursor-pointer p-1 h-full rounded-xl group sm:flex space-x-6 
                    ` + (user.admin
                        ? `text-white bg-gradient-to-r from-rose-600 to-red-500`
                        : user.roles.includes('staff')
                        ? `text-white bg-gradient-to-r from-violet-500 to-fuchsia-400`
                        : `text-gray-700 dark:text-gray-200 bg-slate-900 dark:bg-white dark:bg-opacity-10 bg-opacity-10 hover:bg-opacity-25`)
                    + `
                    shadow-xl text-ellipsis overflow-hidden">
                <img src="{avatar_url}" alt="User icon" loading="lazy" width="1000" height="667" class="h-20 sm:h-full w-full sm:w-4/12 object-cover object-top rounded-lg transition duration-500 group-hover:scale-90">
                <div class="sm:w-8/12 pl-0 p-5 h-full">
                    <div class="space-y-2 flex flex-col h-full justify-between">
                        <div class="space-y-4">
                            <h4 class="text-2xl font-semibold">{name} ` + (user.admin
                                ? `<i class="fa-solid fa-crown"></i>`
                                : user.roles.includes('staff')
                                ? `<i class="fa-solid fa-gavel"></i>`
                                : user.type === 'Organization'
                                ? `<i class="fa-solid fa-users"></i>`
                                : ``)
                            +`</h4>
                            ` + (user.bio != null ? `<p>` + user.bio + `</p>` : '') +`
                        </div>
                        <div class="mt-auto flex flex-wrap space-x-2">
                            <h2 class="text-md"><i class="fa-solid fa-box-open text-emerald-400"></i> ` + user.resources.length + `</h2>
                            <h2 class="text-md"><i class="fa-regular fa-star text-amber-400"></i> {followers}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, {...user,
            name: (user.name || user.login)
        });
