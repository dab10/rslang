/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getWords } from '../services/words';
import { Word } from '../../../types';
import { clear, getElementsList, getRandomWord, getRandomWords } from '../utils';
import { drawLevels } from '../view/levels';
import { nextWord } from '../view/next';
import { progress } from '../view/progress';
import { showResult } from '../view/result';
import { checkIcon, nextDefaultText, nextNextText } from './settings';
import success from '../assets/sounds/success.wav';
import mistake from '../assets/sounds/error.mp3';
import { host } from '../../auth/controllers/hosts';
import { displaySwitcher } from '../view/switcher';

export default class Game {
    root: HTMLElement;
    progress: HTMLElement;
    container: HTMLElement;
    next: HTMLButtonElement;
    audio: HTMLAudioElement;

    words: Word[] = [];
    group: number;
    current: Word | undefined;
    count: number;
    answers: HTMLElement[] = [];

    selected: string[];
    correct?: string[] = [];
    incorrect?: string[] = [];
    canMoveToNext = false;
    isRestartGame = false;
    isMute: boolean;

    constructor(root: HTMLElement, group?: number) {
        this.root = root;
        this.container = <HTMLElement>document.createElement('div');
        this.progress = <HTMLElement>document.createElement('div');
        this.next = <HTMLButtonElement>document.createElement('button');
        this.progress.classList.add('game__progress');
        this.audio = new Audio();
        this.isMute = false;
        this.selected = [];
        this.count = 0;
        this.group = group || 0;
        this.container.className = 'game';
        this.next.classList.add('game__next_word');
        this.next.innerText = nextDefaultText;
        this.next.addEventListener('click', this.onClickNext);
        document.addEventListener('keydown', this.onKeyPress);
    }

    start = async (): Promise<void> => {
        this.group === 0 && !this.isRestartGame ? await this.showLevels() : await this.onLevelSelect(this.group);
        await this.render();
    };

    showLevels = async (): Promise<void> => {
        await drawLevels(this.container, this.onLevelSelect);
    };

    onLevelSelect = async (level: number): Promise<void> => {
        await clear(this.container);
        this.progress.append(...progress());
        this.group = level;
        try {
            const words = await getWords(Math.floor(Math.random() * 31), this.group);
            if (typeof words !== 'undefined') {
                this.words = words;
                this.current = await getRandomWord(this.selected, this.words);
                const variants = await getRandomWords(this.current, this.words);
                this.selected?.push(this.current.id);

                await nextWord(this.container, this.current, variants);
                this.container.append(this.next);
                this.render();
                displaySwitcher(this.isMute);
            }
        } catch (Exception) {
            console.log(Exception);
        }
    };

    onClickNext = (e: Event) => {
        this.canMoveToNext ? this.onNextWord() : this.onSelectVariant(e);
    };

    onKeyPress = async (e: Event): Promise<void> => {
        switch ((e as KeyboardEvent).key) {
            case ' ':
                if (this.canMoveToNext) this.onNextWord();
                else this.playAudio(`${host}/${this.current.audio}`);
                break;
            case '1':
                if (this.canMoveToNext) return;
                else this.onSelectVariant(e);
                break;
            case '2':
                if (this.canMoveToNext) return;
                else this.onSelectVariant(e);
                break;
            case '3':
                if (this.canMoveToNext) return;
                else this.onSelectVariant(e);
                break;
            case '4':
                if (this.canMoveToNext) return;
                else this.onSelectVariant(e);
                break;
            default:
                return;
        }
    };

    onNextWord = async (): Promise<void> => {
        this.canMoveToNext = false;
        ++this.count;
        if (this.count !== this.words.length) {
            this.current = await getRandomWord(this.selected, this.words);
            const translationVariants = await getRandomWords(this.current, this.words);
            this.selected.push(this.current.id);

            await nextWord(this.container, this.current, translationVariants);
            this.container.append(this.next);
            this.render();
        } else {
            await this.endGame();
        }
    };

    onSelectVariant = async (e: Event): Promise<void> => {
        let path = success;
        let correctAnswer: boolean;

        const elementCorrect = this.container.querySelector(
            `[data-word="${this.current?.wordTranslate}"]`
        ) as HTMLElement;

        const target =
            e instanceof KeyboardEvent
                ? (this.container.querySelector(`[data-key="${e.key}"]`) as HTMLElement)
                : (e.target as HTMLElement);

        this.updateCard();
        this.updateProgress();
        this.container.append(this.audio);

        if (target && target.dataset) {
            const { word } = target.dataset;
            correctAnswer = word === this.current?.wordTranslate;

            if (correctAnswer) {
                target.classList.add('selected-correct');
                target.innerHTML = `${checkIcon} ${target.innerText}`;
                if (this.current) this.correct?.push(this.current.id);
            } else {
                target.classList.add('selected-mistake');
                elementCorrect.classList.add('unselected-correct');
                path = mistake;
                if (this.current) this.incorrect?.push(this.current.id);
            }
        } else {
            elementCorrect.classList.add('unselected-correct');
            path = mistake;
        }

        this.canMoveToNext = true;
        this.next.innerText = nextNextText;
        getElementsList('.answers__item').forEach((item) => {
            item.removeEventListener('click', this.onSelectVariant);
            if (!item.classList.contains('selected-correct') && !item.classList.contains('unselected-correct')) {
                item.classList.add('unselected');
            }
        });

        this.playAudio(path);
    };

    render = async (): Promise<void> => {
        clear(this.root);
        this.root.append(this.progress, this.container);
        this.next.innerText = nextDefaultText;
        getElementsList('.answers__item').forEach((item) => item.addEventListener('click', this.onSelectVariant));
    };

    updateProgress = () => {
        this.progress.querySelector(`[data-count="${this.count}"]`)?.classList.add('marked');
    };

    updateCard = () => {
        const image = this.container.querySelector('.word__image') as HTMLImageElement;
        const translation = this.container.querySelector('.word__translation') as HTMLElement;
        image.style.display = 'block';
        translation.innerHTML = `<strong>${this.current?.word}</strong>`;
    };

    playAudio = (path: string) => {
        if (!this.isMute) {
            this.audio.pause();
            this.audio.src = path;
            this.audio.addEventListener('canplaythrough', async () => {
                await this.audio.play();
            });
        }
    };

    endGame = async (): Promise<void> => {
        this.next.disabled = true;
        const correct = this.words.filter((item) => this.correct?.includes(item.id));
        const incorrect = this.words.filter((item) => this.incorrect?.includes(item.id));
        clear(this.container);
        showResult(correct, incorrect, this.onRestart);
    };

    resetGame = (): void => {
        this.progress.querySelectorAll('.game__progress_item').forEach((item) => item.classList.remove('marked'));
        this.next.disabled = false;
        this.count = 0;
        this.selected.length = 0;
        this.words.length = 0;
        this.correct!.length = 0;
        this.incorrect!.length = 0;
        this.current = undefined;
        this.isRestartGame = true;
    };

    onRestart = () => {
        this.resetGame();
        this.start();
    };
}
