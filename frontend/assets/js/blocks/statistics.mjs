import {dom} from "../lib/dom.mjs";
export const statistics = (data) => dom.create(`
        <div class="w-full h-full p-2 transition-opacity">
            <div class="p-6 h-full rounded-xl group sm:flex space-x-2 bg-slate-900 shadow-xl">
                <div class="space-y-4 flex flex-col h-full text-gray-300 text-lg">
                    <h3 class="text-xl">This Week</h3>
                    <table>
                        <tr>
                            <td class="text-emerald-300 pr-2">{pushes}</td><td>Changes</td>
                        </tr>
                        <tr>
                            <td class="text-emerald-300 pr-2">{prs}</td><td>Pull Requests</td>
                        </tr>
                        <tr>
                            <td class="text-emerald-300 pr-2">{forks}</td><td>Forks Created</td>
                        </tr>
                        <tr>
                            <td class="text-emerald-300 pr-2">{issues}</td><td>Issues Created</td>
                        </tr>
                        <tr>
                            <td class="text-emerald-300 pr-2">{reviews}</td><td>Code Reviews</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>`, data);
