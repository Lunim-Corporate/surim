export const createID = (string: string) => {
    return string
        .toLowerCase() //lowercase for consistency
        .replace(/[^\w\s]/gi, "") //remove special chars
        .replace(/\s+/g, "-"); //replace spaces with hyphens
}