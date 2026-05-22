/**
 * Curated, freely-accessible educational websites for students.
 * Sourced from open Dutch (and international) learning-material providers.
 */
export type StudentResource = {
  name: string;
  url: string;
  description: string;
  category: "Video's" | "Lesmateriaal" | "Oefenen";
  lang: "NL" | "EN";
};

export const studentResources: StudentResource[] = [
  {
    name: "Schooltv",
    url: "https://schooltv.nl",
    description:
      "Leerzame video's over alle vakken — van rekenen en taal tot natuur en geschiedenis.",
    category: "Video's",
    lang: "NL",
  },
  {
    name: "Wikiwijs",
    url: "https://wikiwijs.nl",
    description:
      "Gratis open lesmateriaal en oefeningen, gemaakt en gedeeld door leerkrachten.",
    category: "Lesmateriaal",
    lang: "NL",
  },
  {
    name: "Khan Academy",
    url: "https://nl.khanacademy.org",
    description:
      "Oefen in je eigen tempo met rekenen, taal en veel meer — met uitlegvideo's.",
    category: "Oefenen",
    lang: "NL",
  },
  {
    name: "Openleermateriaal",
    url: "https://www.openleermateriaal.nl",
    description:
      "Een verzameling van vrij te gebruiken Nederlandse leermaterialen voor school.",
    category: "Lesmateriaal",
    lang: "NL",
  },
  {
    name: "OER Commons",
    url: "https://www.oercommons.org",
    description:
      "Een grote bibliotheek met gratis lesmateriaal en activiteiten voor alle leeftijden.",
    category: "Lesmateriaal",
    lang: "EN",
  },
  {
    name: "CK-12",
    url: "https://www.ck12.org",
    description:
      "Gratis lessen, oefeningen en boeken voor alle vakken om zelf te ontdekken.",
    category: "Oefenen",
    lang: "EN",
  },
];
