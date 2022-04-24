import {dom} from "../lib/dom.mjs";
import {login} from "./login.mjs";
export const header = dom.create(`
    <section class="menu flex flex-auto justify-center content-center">
        <div class="rotate-90 sm:rotate-0 transition my-auto mr-auto h-full sm:p-4 select-none flex flex-col">
            <h2 class="h-[1.75rem] text-lg text-slate-300 dark:text-gray-500"><i class="fa-solid fa-music"></i>.bsk</h2>
            <h1 class="text-5xl text-slate-900 dark:text-gray-50 transition duration-300"><span class="hover:text-slate-700 hover:dark:text-gray-200">Sy</span><span class="hover:text-slate-700 hover:dark:text-gray-200">zy</span><span class="hover:text-slate-700 hover:dark:text-gray-200">gy</span></h1>
            <h2 class="h-[1.75rem]"></h2>
        </div>
        <div class="select-none">
            <div class="my-8 -mx-6 sm:mx-0 w-24 sm:w-[300px] xl:w-auto flex flex-wrap justify-center items-center 2xl:container py-1 lg:py-2.5">
                <div onclick="window.location.href = '/home'" class="m-4 xl:mt-8 cursor-pointer {button_size} rounded-[1rem] rotate-45 xl:rotate-[35deg] overflow-hidden hover:rotate-0 transition duration-300 hover:scale-110">
                    <div class="flex flex-auto items-center bg-gradient-to-r from-red-500 to-rose-400 w-full h-full -rotate-45 xl:-rotate-[35deg] hover:rotate-0 scale-125 mx-auto transition duration-300">
                        <div class="my-auto mx-auto items-center">
                            <h2 aria-label="Home" class="px-4 uppercase text-white text-2xl">
                                <i class="fa-solid fa-house"></i>
                            </h2>
                        </div>
                    </div>
                </div>
                <div onclick="window.location.href = '/about'" class="m-4 xl:mt-2.5 cursor-pointer {button_size} rounded-[1rem] rotate-45 xl:rotate-[40deg] overflow-hidden hover:rotate-0 transition duration-300 hover:scale-110">
                    <div class="flex flex-auto items-center bg-gradient-to-r from-orange-500 to-amber-400 w-full h-full -rotate-45 xl:-rotate-[40deg] hover:rotate-0 scale-125 mx-auto transition duration-300">
                        <div class="my-auto mx-auto items-center">
                            <h2 aria-label="About" class="px-4 uppercase text-white text-2xl">
                                <i class="fa-solid fa-book"></i>
                            </h2>
                        </div>
                    </div>
                </div>
                <div onclick="window.location.href = '/users'" class="m-4 xl:mt-0 cursor-pointer {button_size} rounded-[1rem] rotate-45 xl:rotate-[45deg] overflow-hidden hover:rotate-0 transition duration-300 hover:scale-110">
                    <div class="flex flex-auto items-center bg-gradient-to-r from-green-500 to-emerald-400 w-full h-full -rotate-45 xl:-rotate-45 hover:rotate-0 scale-125 mx-auto transition duration-300">
                        <div class="my-auto mx-auto items-center">
                            <h2 aria-label="Profile" class="px-4 uppercase text-white text-2xl">
                                <i class="fa-solid fa-id-badge"></i>
                            </h2>
                        </div>
                    </div>
                </div>
                <div onclick="window.location = 'https://github.com/Moderocky/Syzygy'" class="{adjust_button} xl:mt-2.5 cursor-pointer {button_size} rounded-[1rem] rotate-45 xl:rotate-[50deg] overflow-hidden hover:rotate-0 transition duration-300 hover:scale-110">
                    <div class="flex flex-auto items-center bg-gradient-to-r from-sky-500 to-cyan-400 w-full h-full -rotate-45 xl:-rotate-[50deg] hover:rotate-0 scale-125 mx-auto transition duration-300">
                        <div class="my-auto mx-auto items-center">
                            <h2 aria-label="Source" class="px-4 uppercase text-white text-2xl">
                                <i class="fa-solid fa-code-branch"></i>
                            </h2>
                        </div>
                    </div>
                </div>
                <div onclick="window.location = 'https://byteskript.org/'" class="{adjust_button} xl:mt-8 cursor-pointer {button_size} rounded-[1rem] rotate-45 xl:rotate-[55deg] overflow-hidden hover:rotate-0 transition duration-300 hover:scale-110">
                    <div class="flex flex-auto items-center bg-gradient-to-r from-indigo-500 to-violet-400 w-full h-full -rotate-45 xl:-rotate-[55deg] hover:rotate-0 scale-125 mx-auto transition duration-300">
                        <div class="my-auto mx-auto items-center">
                            <h2 aria-label="ByteSkript" class="px-4 uppercase text-white text-2xl">
                                <i class="fa-solid fa-music"></i>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div data-login-area class="rotate-90 sm:rotate-0 transition my-auto ml-auto sm:p-4 select-none">
        </div>
    </section>`, {adjust_button: 'm-4 sm:-mt-4 xl:m-4', button_size: 'w-16 h-16 xl:w-20 xl:h-20'});
header.querySelector('[data-login-area]').appendChild(login);
