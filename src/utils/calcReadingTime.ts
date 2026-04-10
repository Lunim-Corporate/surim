// Prismic
import { asText } from "@prismicio/helpers";
import { RichTextField } from "@prismicio/types";

export const calculateReadingTime = (articleMainContent: RichTextField): number => {
    const averageNumOfWordsHumanReadsPerMinute: number = 250;
    const mainArticleContentWordCount: number = asText(articleMainContent).split(/\s+/).length;
    // Never show less than 1 minute reading time
    const readingTime: number = Math.max(1, Math.ceil(mainArticleContentWordCount / averageNumOfWordsHumanReadsPerMinute));
    return readingTime;
}