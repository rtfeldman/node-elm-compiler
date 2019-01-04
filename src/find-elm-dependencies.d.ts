declare module "find-elm-dependencies" {
    export function findAllDependencies(src: string): Promise<string[]>
}