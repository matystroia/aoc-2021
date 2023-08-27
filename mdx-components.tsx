import type { MDXComponents } from "mdx/types";

import { ObjectInspector } from "./app/components/ObjectInspector";
import { Tutorial } from "./app/components/Tutorial";

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ObjectInspector,
        Tutorial,
        ...components,
    };
}
