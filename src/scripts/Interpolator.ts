/** @format */

/**
 * * How To Use
 * 1. Interpolator クラスをインポート
 * 2. this.interpolator = new Interpolator でインスタンス化
 * 3. registerInterpolation を使ってアニメーションを登録
 * 4. 全てのアニメーションを登録後、ループを回す前に、initInterpolation を実行する
 * 5. rAF ループ内で this.interpolator.update( 進捗率 ) を実行し更新する
 */
export class Interpolator {
    private interpolationParams: InterpolationParams[];
    isRunning: boolean;

    /**
     * @constructor
     */
    constructor() {
        this.interpolationParams = [];
        this.isRunning = false;
    }

    /**
     * # アニメーション設定用の関数
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     * @param {function} easing - イージング関数
     * @param {function} callback - コールバック関数
     */
    registerInterpolation(start: number, end: number, callback: InterpolationCallback, easing: (x: number) => number = Interpolator.getEasingFunction('linear')) {
        const props = {
            isAnimationFinished: false,
        };
        this.interpolationParams.push({ start, end, callback, easing, props });
    }

    /**
     * # registerInterpolation で全ての登録が終了後に一度実行する処理
     */
    initInterpolation(progress: number) {
        this.update(progress);
        this.isRunning = false;
    }

    /**
     * # interpolationParams のリセット
     */
    resetInterpolation() {
        this.interpolationParams = [];
    }

    /**
     * # rAF で実行する更新処理
     */
    update(progress: number) {
        for (const { start, end, easing, callback, props } of this.interpolationParams) {
            if (progress >= start && progress <= end) {
                this.isRunning = true;
                props.isAnimationFinished = false;
                const sp = Interpolator.scaledProgress(progress, start, end);
                callback(easing(sp), true);
            } else if (!props.isAnimationFinished && progress > end) {
                this.isRunning = false;
                props.isAnimationFinished = true;
                callback(easing(1), false);
            }
        }
    }

    /**
     * # 補間関数
     * @param {number} m - 開始値
     * @param {number} M - 終了値
     * @param {number} t - 補間係数
     */
    static lerp(m: number, M: number, t: number) {
        return (1 - t) * m + t * M;
    }

    /**
     * # 区間ごとに正規化された進捗率
     * @param {number} progress - 現在値
     * @param {number} start - 開始値
     * @param {number} end - 終了値
     */
    static scaledProgress(progress: number, start: number, end: number) {
        const percent = (progress - start) / (end - start);
        return Math.min(Math.max(percent, 0.0), 1.0);
    }

    /**
     * # イージング関数取得用関数
     * @param {number} name - イージング関数名
     */
    static getEasingFunction(name: EasingFunction) {
        const easingFunctions: Record<EasingFunction, (x: number) => number> = {
            // Linear
            linear: (x) => x,
            // Sine
            easeInSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
            easeOutSine: (x) => Math.sin((x * Math.PI) / 2),
            easeInOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
            // Quad
            easeInQuad: (x) => x * x,
            easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
            easeInOutQuad: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
            // Cubic
            easeInCubic: (x) => x * x * x,
            easeOutCubic: (x) => 1 - Math.pow(1 - x, 3),
            easeInOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
            // Quart
            easeInQuart: (x) => x * x * x * x,
            easeOutQuart: (x) => 1 - Math.pow(1 - x, 4),
            easeInOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
            // Quint
            easeInQuint: (x) => x * x * x * x * x,
            easeOutQuint: (x) => 1 - Math.pow(1 - x, 5),
            easeInOutQuint: (x) => (x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2),
            // Expo
            easeInExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
            easeOutExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
            easeInOutExpo: (x) => (x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
            // Circ
            easeInCirc: (x) => 1 - Math.sqrt(1 - Math.pow(x, 2)),
            easeOutCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
            easeInOutCirc: (x) => (x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2),
            // Back
            easeInBack: (x) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return c3 * x * x * x - c1 * x * x;
            },
            easeOutBack: (x) => {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
            },
            easeInOutBack: (x) => {
                const c1 = 1.70158;
                const c2 = c1 * 1.525;
                return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
            },
            // Elastic
            easeInElastic: (x) => {
                const c4 = (2 * Math.PI) / 3;
                return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
            },
            easeOutElastic: (x) => {
                const c4 = (2 * Math.PI) / 3;

                return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
            },
            easeInOutElastic: (x) => {
                const c5 = (2 * Math.PI) / 4.5;
                return x === 0
                    ? 0
                    : x === 1
                    ? 1
                    : x < 0.5
                    ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
                    : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
            },
            // Bounce
            easeInBounce(x) {
                return 1 - easingFunctions.easeOutBounce(1 - x);
            },
            easeOutBounce: (x) => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (x < 1 / d1) {
                    return n1 * x * x;
                } else if (x < 2 / d1) {
                    return n1 * (x -= 1.5 / d1) * x + 0.75;
                } else if (x < 2.5 / d1) {
                    return n1 * (x -= 2.25 / d1) * x + 0.9375;
                } else {
                    return n1 * (x -= 2.625 / d1) * x + 0.984375;
                }
            },
            easeInOutBounce(x) {
                return x < 0.5 ? (1 - easingFunctions.easeOutBounce(1 - 2 * x)) / 2 : (1 + easingFunctions.easeOutBounce(2 * x - 1)) / 2;
            },
        };
        return easingFunctions[name];
    }
}

/**
 * ######### 型 ###########
 */
type InterpolationCallback = (scaledProgress: number, isAnimating: boolean) => void;

interface InterpolationParams {
    start: number;
    end: number;
    callback: InterpolationCallback;
    easing: (x: number) => number;
    props: Record<string, unknown>;
}

type EasingFunction =
    | 'linear'
    | 'easeInSine'
    | 'easeOutSine'
    | 'easeInOutSine'
    | 'easeInQuad'
    | 'easeOutQuad'
    | 'easeInOutQuad'
    | 'easeInCubic'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeInQuart'
    | 'easeOutQuart'
    | 'easeInOutQuart'
    | 'easeInQuint'
    | 'easeOutQuint'
    | 'easeInOutQuint'
    | 'easeInExpo'
    | 'easeOutExpo'
    | 'easeInOutExpo'
    | 'easeInCirc'
    | 'easeOutCirc'
    | 'easeInOutCirc'
    | 'easeInBack'
    | 'easeOutBack'
    | 'easeInOutBack'
    | 'easeInElastic'
    | 'easeOutElastic'
    | 'easeInOutElastic'
    | 'easeInBounce'
    | 'easeOutBounce'
    | 'easeInOutBounce';
