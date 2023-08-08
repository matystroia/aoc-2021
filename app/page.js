import { ChallengeNames } from "./input/names";

function Day({ day, name }) {
    return (
        <div className="relative w-32 h-32 font-mono rounded-sm cursor-pointer bg-slate-950 group preserve-3d center">
            <div className="absolute inset-0 flex items-end p-2 text-2xl transition-transform origin-left border-2 border-dashed rounded-sm bg-slate-700 group-hover:-rotate-y-90 border-slate-500 text-slate-200">
                {day}
            </div>
            <div className="p-4 text-center">{name}</div>
        </div>
    );
}

export default function Page() {
    return (
        <main className="flex flex-col items-center justify-center w-screen h-screen bg-slate-800">
            <h1 className="mb-8 font-mono text-4xl text-slate-100">
                Advent Of Code <span className="">2021</span>
            </h1>
            <div className="flex flex-wrap gap-4 perspective-[1200px] justify-center max-w-3xl py-8 bg-slate-900 rounded-md">
                {Object.entries(ChallengeNames).map(([day, name]) => (
                    <Day key={day} day={day} name={name} />
                ))}
            </div>
        </main>
    );
}
