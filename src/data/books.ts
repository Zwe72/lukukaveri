
export type Book = {
    id: string;
    title: string;
    author: string;
    year: string | null;
    description: string | null;
    coverId?: number | null;
    isbn?: string | null;
};

export const books: Book[] = [
  {
    id: '1',
    title: 'Metsän hiljaisuus',
    author: 'Esimerkkikirjailija',
    year: '2024',
    description:
      'Tarina luonnosta, hiljaisuudesta ja tuntemattomasta matkasta.',
  },
  {
    id: '2',
    title: 'Matka tuntemattomaan',
    author: 'Toinen kirjailija',
    year: '2022',
    description:
      'Seikkailu, jossa päähenkilö lähtee tutkimaan tuntematonta maailmaa.',
  },
  {
    id: '3',
    title: 'Viimeinen tarina',
    author: 'Kolmas kirjailija',
    year: '2023',
    description:
      'Kertomus ystävyydestä, muistoista ja elämän tärkeistä hetkistä.',
  },
];