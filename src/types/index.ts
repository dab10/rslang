export type GameLevel = {
    group: number;
    color: string;
};

export interface Word {
    id: string;
    _id?: string;
    group: number;
    page: 0;
    word: string;
    image: string;
    audio: string;
    audioMeaning: string;
    audioExample: string;
    textMeaning: string;
    textExample: string;
    transcription: string;
    wordTranslate: string;
    textMeaningTranslate: string;
    textExampleTranslate: string;
    userWord: {
        difficulty: string;
        optional?: IOptional;
    };
}

export interface IOptional {
    date: string;
    isWordNew: boolean;
    rightAnswers: number;
    wrongAnswers: number;
}

export type HardWord = { _id: string } & Omit<Word, 'id'>;

export type TSelectHandler = (level: number) => Promise<void>;

export enum ResultType {
    RIGHT = '../assets/sounds/success.wav',
    MISTAKE = '../assets/sounds/error.mp3',
}
