import { ChallengeNames } from "./input/names";

// TODO: Should maybe move `components` to top level

export default function Page() {
    return (
        <main>
            <h1>Advent Of Code 2021</h1>
            {Object.entries(ChallengeNames).map(([day, name]) => (
                <div key={day}>{name}</div>
            ))}
        </main>
    );
}
