export interface RequestDto {
  positions: Position[];
}

interface Position {
  correct: boolean;
  coords: number[];
}
