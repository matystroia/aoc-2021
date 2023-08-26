export function MobileFallback() {
    return (
        <div className="flex flex-col items-center w-screen h-screen gap-4 overflow-y-auto bg-slate-950">
            <div className="max-w-md p-8 m-8 mb-2 prose rounded-lg bg-slate-900 prose-p:text-slate-300">
                <h1 className="text-slate-400">Sorry!</h1>
                <p className="">
                    I appreciate you taking the time to check out my work but it seems like
                    you&apos;re on a mobile device.
                </p>
                <p>
                    I developed this with desktop screens in mind and sadly didn&apos;t have the
                    time to make it look decent on smaller screens.
                </p>
                <p>You&apos;re welcome to come back on a laptop or tablet whenever :)</p>
            </div>
            <div className="max-w-md p-8 m-8 mt-0 prose rounded-lg opacity-25 bg-slate-900 prose-p:text-slate-300">
                <p>
                    Here&apos; the (terrible) media query I&apos;m using to display this fallback:
                </p>
                <pre className="text-slate-400">
                    (min-width: 800px) and <br />
                    (min-height: 600px)
                </pre>
            </div>
        </div>
    );
}
