export type MapLocation = {
  lat: number;
  lng: number;
  descritpion?: string;
  shortDescription?: string;
};

export type AppData = {
  location?: MapLocation | null;
  opened?: boolean;
  active?: boolean;
};
