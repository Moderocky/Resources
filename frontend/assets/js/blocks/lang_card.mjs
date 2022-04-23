import {dom} from "../lib/dom.mjs";
import {getLanguage} from "../lib/languages.mjs";
export const lang = (language) => dom.create(`
        <div class="w-6/12 sm:w-4/12 lg:w-3/12 p-2 opacity-0 transition-opacity">
            <div aria-label="{name}" class="select-none cursor-pointer p-1 h-full rounded-xl group sm:flex space-x-6 bg-{colour} bg-opacity-100 shadow-xl hover:bg-opacity-75 text-ellipsis overflow-hidden">
                <div class="w-full p-5 h-full">
                    <div class="space-y-2 flex flex-col h-full justify-between">
                        <h4 class="text-2xl font-semibold text-gray-100"><i class="{icon}"></i> {name}</h4>
                        <p class="text-gray-200">{description}</p>
                    </div>
                </div>
            </div>
        </div>`, {...getLanguage(language)});

