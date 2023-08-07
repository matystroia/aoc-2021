import { useEffect, useRef, useState } from "react";
import { getSegmentIntersection } from "../utils";

const groundY = 0;

const isCollision = (
    { position: { x: x1, y: y1, z: z1 } },
    { position: { x: x2, y: y2, z: z2 } }
) => Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) + (z1 - z2) * (z1 - z2)) < 100;

export function usePhysics(objects) {
    const [positions, setPositions] = useState(objects.map((o) => o.initialPosition));
    const [rotations, setRotations] = useState(objects.map((o) => ({ x: 0, y: 0, z: 0 })));

    const objectsRef = useRef(
        objects.map((o) => ({
            mass: o.mass,
            bounciness: o.bounciness,

            velocity: { x: 0, y: 0, z: 0 },
            position: o.initialPosition,

            torque: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },

            // TODO: move to map of object pairs
            lastCollision: Date.now(),
        }))
    );

    useEffect(() => {
        const handle = setInterval(() => {
            const elapsed = 0.01;
            const now = Date.now();

            for (const o of objectsRef.current) {
                for (const o2 of objectsRef.current) {
                    if (o === o2) continue;
                    if (isCollision(o, o2)) {
                    }
                }

                // Ground collision
                if (!o.atRest && o.position.y === groundY) {
                    // if (now - o.lastCollision >= 100) {
                    // o.lastCollision = now;
                    o.velocity.y = o.velocity.y * -o.bounciness;
                    o.velocity.x = Math.random() * 200 - 100;

                    o.torque.x = Math.random() * 500;
                    o.torque.y = Math.random() * 500;
                    o.torque.z = Math.random() * 500;
                    // }
                }

                // Gravity
                if (!o.atRest) {
                    o.velocity.y += 5000 * elapsed;
                }

                if (Math.abs(o.velocity.y) < 100 && o.position.y === groundY) {
                    o.atRest = true;
                    o.velocity = { x: 0, y: 0, z: 0 };
                    o.torque = { x: 0, y: 0, z: 0 };
                    o.rotation = { x: 0, y: 0, z: 0 };
                }

                // Velocity
                o.position = {
                    x: o.position.x + o.velocity.x * elapsed,
                    y: Math.min(o.position.y + o.velocity.y * elapsed, groundY),
                    z: o.position.z + o.velocity.z * elapsed,
                };

                // Torque
                o.rotation = {
                    x: o.rotation.x + o.torque.x * elapsed,
                    y: o.rotation.y + o.torque.y * elapsed,
                    z: o.rotation.z + o.torque.z * elapsed,
                };
            }
        }, 10);
        return () => clearInterval(handle);
    }, [objects]);

    useEffect(() => {
        const handle = requestAnimationFrame(function animate() {
            setPositions(objectsRef.current.map((o) => o.position));
            setRotations(objectsRef.current.map((o) => o.rotation));
            requestAnimationFrame(animate);
        });
        return () => cancelAnimationFrame(handle);
    }, []);

    return { positions, rotations };
}
