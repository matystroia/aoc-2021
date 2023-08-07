export function Cube({ children }) {
    return (
        <div className="relative preserve-3d">
            {children}
            <div className="absolute inset-0 [transform:rotateX(90deg)] origin-bottom">
                {children}
            </div>
            <div className="absolute inset-0 [transform:rotateX(-90deg)] origin-top">
                {children}
            </div>
            <div className="absolute inset-0 [transform:rotateY(90deg)] origin-left">
                {children}
            </div>
            <div className="absolute inset-0 [transform:rotateY(-90deg)] origin-right preserve-3d">
                {children}
                <div className="absolute inset-0 [transform:rotateY(-90deg)] origin-left">
                    {children}
                </div>
            </div>
        </div>
    );
}
