import {dom} from "../lib/dom.mjs";
export const card = (repository) => dom.create(`
        <div class="w-full md:w-6/12 p-2 opacity-0 transition-opacity">
            <div aria-label="{full_name}" onclick="window.location.href = '/resource?id={id}'" class="select-none cursor-pointer p-1 h-full rounded-xl group sm:flex space-x-6 bg-slate-900 dark:bg-white dark:bg-opacity-10 bg-opacity-10 shadow-xl hover:bg-opacity-25 text-ellipsis overflow-hidden">
                <img src="{owner_avatar_url}" alt="Resource icon" loading="lazy" width="1000" height="667" class="h-20 sm:h-full w-full sm:w-4/12 object-cover object-top rounded-lg transition duration-500 group-hover:scale-90">
                <div class="sm:w-8/12 pl-0 p-5 h-full">
                    <div class="space-y-2 flex flex-col h-full justify-between">
                        <div class="space-y-4">
                            <h4 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{name}</h4>
                            <p class="text-gray-600 dark:text-gray-400">{description}</p>
                        </div>
                        <div class="mt-auto flex flex-wrap space-x-2">
                            <h2 class="text-md">{owner_login}</h2>
                            <h2 class="text-md"><i class="fa-regular fa-star text-amber-400"></i> {stargazers_count}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>`, {...repository});
