/** @format */

import { Interpolator } from './Interpolator';

export default class Animation {
    private readonly interpolator: Interpolator;
    private time: number; // ms
    private previousTime: number; // ms
    private currentTime: number; // ms
    private readonly duration: number;
    private readonly target: HTMLElement;
    private readonly resetBtn: HTMLButtonElement;

    static SELECTOR = {
        target: '[data-target]',
        reset: '[data-reset]',
    };

    /**
     * @constructor
     */
    constructor() {
        this.interpolator = new Interpolator();
        this.time = 0;
        this.currentTime = Date.now();
        this.previousTime = Date.now();
        this.duration = 1000;

        const resetBtn = document.querySelector<HTMLButtonElement>(Animation.SELECTOR.reset);
        const target = document.querySelector<HTMLElement>(Animation.SELECTOR.target);
        if (!resetBtn || !target) throw new Error('resetBtn or target is missing or null');
        this.target = target;
        this.resetBtn = resetBtn;

        this.update = this.update.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.resetBtn.addEventListener('click', this.handleClick);
    }

    /**
     * # 初回実行処理
     */
    init() {
        this.registerInterpolation();
    }

    /**
     * # rAF で実行する更新処理
     */
    update() {
        console.log('running')
        this.updateTime();
        this.interpolator.update(this.time);

        if (this.interpolator.isRunning) {
            requestAnimationFrame(this.update);
        }
    }

    /**
     * # click イベントハンドラー
     */
    private handleClick() {
        this.resetTime();
        this.update();
    }

    /**
     * # アニメーションの登録
     */
    private registerInterpolation() {
        this.interpolator.registerInterpolation(
            0,
            this.duration,
            (pr, isAnimating) => {
                const transform = {
                    x: `translateX(${Interpolator.lerp(0, 400, pr)}px)`,
                    rotate: `rotate(${Interpolator.lerp(0, 360, pr)}deg)`,
                };
                this.target.style.transform = `${transform.x} ${transform.rotate}`;

                !isAnimating && console.log('animation 1 finished')
            },
            Interpolator.getEasingFunction('easeOutBounce')
        );

        this.interpolator.registerInterpolation(
            this.duration,
            this.duration * 2,
            (pr, isAnimating) => {
                const transform = {
                    x: `translateX(${Interpolator.lerp(400, 0, pr)}px)`,
                    rotate: `rotate(${Interpolator.lerp(360, 0, pr)}deg)`,
                };
                this.target.style.transform = `${transform.x} ${transform.rotate}`;

                !isAnimating && console.log('animation 2 finished')
            },
            Interpolator.getEasingFunction('easeOutBounce')
        );

        this.interpolator.initInterpolation(this.time);
    }

    /**
     * # 時間の更新
     */
    private updateTime() {
        this.currentTime = Date.now();
        const deltaTime = this.currentTime - this.previousTime;
        this.time += deltaTime;
        this.previousTime = this.currentTime;
    }

    /**
     * # 時間のリセット
     */
    private resetTime() {
        this.currentTime = Date.now();
        this.previousTime = Date.now();
        this.time = 0;
    }
}
