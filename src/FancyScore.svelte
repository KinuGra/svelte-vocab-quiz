<script>
    import {fly} from 'svelte/transition';

    let currentScore = 0;
    let renzokuSeikai = 0;
    let count = 0;
    let Allcorrectcount = 0;
    let showDelta = false;
    let BestrenzokuSeikai = 0;
    let Br = -5;

    /** 回答時のスコアの更新 */
    export function updateScore(isCorrect) {
        count += 1;
        if (isCorrect) {
            renzokuSeikai += 1;
            Allcorrectcount += 1;
            currentScore += renzokuSeikai;
            
            // 最高連続正解数を更新
            if (renzokuSeikai > BestrenzokuSeikai) {
                BestrenzokuSeikai = renzokuSeikai;
            }

            showDelta = true;
            setTimeout(() => showDelta = false, 500);
        } else {
            // 連続正解が途切れたとき
            if (BestrenzokuSeikai > Br) {
                Br = BestrenzokuSeikai;
            }
            renzokuSeikai = 0;
        }
    }

    /** スコアを返す */
    export function getScore() {
        return { currentScore, count, Allcorrectcount, BestrenzokuSeikai };
    }

    /** 連続正解数を返す */
    export function getRenzokuSeikai() {
        return renzokuSeikai;
    }
</script>

<div class="bg-blue-500/70 flex justify-around text-xl font-bold p-3">
    <div class="flex justify-start">
        <div>
            スコア: {currentScore}
            {#if showDelta}
                <span class="absolute ml-3 text-pink-500" out:fly={{ y: -20 }}>+{renzokuSeikai}</span>
            {/if}
        </div>
    </div>
    <div>連続正解数: {renzokuSeikai}</div>
</div>
