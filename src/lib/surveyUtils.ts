export function generateSurveySlug(slug: string, surveyNumber: number): string {
  return `${slug}-${surveyNumber}`;
}

export function parseSurveyNumberFromSlug(slug: string): number | null {
  const lastHyphenIndex = slug.lastIndexOf('-');
  if (lastHyphenIndex === -1 || lastHyphenIndex === slug.length - 1) {
    return null;
  }

  const numberPart = slug.substring(lastHyphenIndex + 1);
  const number = parseInt(numberPart, 10);
  return isNaN(number) ? null : number;
}
