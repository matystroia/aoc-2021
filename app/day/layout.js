import { ChallengeWrapper } from "./ChallengeWrapper";
import { Navigation } from "./Navigation";

export default function DayLayout({ children }) {
    return (
        <section className="flex flex-col h-screen bg-slate-800">
            <section className="flex h-full overflow-hidden">
                <Navigation />
                <div className="flex-grow overflow-hidden">
                    <ChallengeWrapper>{children}</ChallengeWrapper>
                </div>
            </section>
        </section>
    );
}
