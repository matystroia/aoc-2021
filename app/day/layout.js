import { ChallengeWrapper } from "./ChallengeWrapper";
import { Navigation } from "./Navigation";

// TODO: Add challenge name
export default function DayLayout({ children }) {
    return (
        <section className="flex flex-row h-screen bg-slate-800">
            <Navigation />
            <div className="overflow-hidden flex-grow">
                <ChallengeWrapper>{children}</ChallengeWrapper>
            </div>
        </section>
    );
}
