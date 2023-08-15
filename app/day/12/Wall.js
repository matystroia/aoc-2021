import clsx from "clsx";

export const Floor = ({ className, height }) => (
    <div
        className={clsx("absolute w-full bg-stone-900", className)}
        style={{
            height,
            backgroundImage:
                `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='0.2'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                `linear-gradient(rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5)),` +
                `linear-gradient(to right, rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5))`,
        }}
    ></div>
);

export const Wall = ({ className, width }) => (
    <div
        className={clsx("absolute h-full bg-stone-900", className)}
        style={{
            width,
            backgroundImage:
                `url("data:image/svg+xml,%3Csvg width='42' height='44' viewBox='0 0 42 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='Page-1' fill='none' fill-rule='evenodd'%3E%3Cg id='brick-wall' fill='%234a3d34' fill-opacity='1'%3E%3Cpath d='M0 0h42v44H0V0zm1 1h40v20H1V1zM0 23h20v20H0V23zm22 0h20v20H22V23z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),` +
                `linear-gradient(rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5)),` +
                `linear-gradient(to right, rgba(0,0,0,0.5),transparent 20%, 80%, rgba(0,0,0,0.5))`,
        }}
    ></div>
);
