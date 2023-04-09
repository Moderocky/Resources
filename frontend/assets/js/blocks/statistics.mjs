import {dom} from "../lib/dom.mjs";

export const statistics = (data) => dom.create(`
        <div class="w-full p-2 opacity-0 transition-opacity">
            <div class="py-6 px-4 m-0 space-y-2 rounded-xl rounded-xl bg-slate-900 dark:bg-white dark:bg-opacity-10 bg-opacity-10 shadow-xl">
                <h5 class="text-xl mb-6 text-gray-600 dark:text-gray-100 text-center">This Month</h5>
                <div class="w-full p-2.5 space-x-2 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-violet-400">
                    <i class="fa-solid fa-up-long w-4"></i> ${data.pushes} Commits
                </div>
                <div class="w-full p-2.5 space-x-2 rounded-lg text-white bg-gradient-to-r from-sky-500 to-cyan-400">
                    <i class="fa-solid fa-code-pull-request w-4"></i> ${data.prs} Pull Requests
                </div>
                <div class="w-full p-2.5 space-x-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-400">
                    <i class="fa-solid fa-code-fork w-4"></i> ${data.forks} Forks Created
                </div>
                <div class="w-full p-2.5 space-x-2 rounded-lg text-white bg-gradient-to-r from-orange-500 to-amber-400">
                    <i class="fa-solid fa-triangle-exclamation w-4"></i> ${data.issues} Issues Reported
                </div>
                <div class="w-full p-2.5 space-x-2 rounded-lg text-white bg-gradient-to-r from-rose-500 to-red-400">
                    <i class="fa-solid fa-magnifying-glass w-4"></i> ${data.reviews} Code Reviews
                </div>
            </div>
        </div>`, data);
