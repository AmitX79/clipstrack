export interface PageSection {
  h: string;
  p: string;
}

export interface PageContent {
  meta: {
    about: { title: string; description: string };
    privacy: { title: string; description: string };
    terms: { title: string; description: string };
    contact: { title: string; description: string };
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    sections: PageSection[];
    closing: string;
  };
  privacy: {
    eyebrow: string;
    title: string;
    intro: string;
    sections: PageSection[];
  };
  terms: {
    eyebrow: string;
    title: string;
    intro: string;
    sections: PageSection[];
  };
  contact: {
    eyebrow: string;
    title: string;
    sub: string;
    email: string;
  };
}